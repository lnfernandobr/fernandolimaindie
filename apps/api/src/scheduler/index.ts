import cron, { type ScheduledTask } from 'node-cron';
import { CronExpressionParser } from 'cron-parser';
import { DEFAULT_POSTS_PLAN, publishTimesToCron, type PostPlanItem } from '@bn/shared';
import { Channel, type ChannelDoc } from '../models/Channel.js';
import { logger } from '../config/logger.js';
import { runChannelPipeline } from '../pipeline/runner.js';

interface ChannelTask {
  channelId: string;
  cronExpr: string;
  timezone: string;
  task: ScheduledTask;
}

const tasks = new Map<string, ChannelTask[]>();

function buildCronList(channel: ChannelDoc): string[] {
  const times = (channel.publishTimes ?? []).filter(Boolean);
  const weekdays = channel.publishWeekdays?.length ? channel.publishWeekdays : [0, 1, 2, 3, 4, 5, 6];
  return publishTimesToCron(times, weekdays).filter((c) => cron.validate(c));
}

function resolvePlan(channel: ChannelDoc): PostPlanItem[] {
  const plan = (channel.postsPlan ?? []).filter(
    (b: any) => b && Number.isFinite(b.count) && Number.isFinite(b.targetReadingMinutes),
  );
  if (plan.length > 0) return plan as PostPlanItem[];
  // Fallback legado: postsPerSlot vira um único bucket de 8min.
  if (Number.isFinite((channel as any).postsPerSlot) && (channel as any).postsPerSlot > 0) {
    return [{ count: (channel as any).postsPerSlot, targetReadingMinutes: 8 }];
  }
  return DEFAULT_POSTS_PLAN;
}

function startTaskForSlot(channel: ChannelDoc & { _id: any }, cronExpr: string): ScheduledTask {
  return cron.schedule(
    cronExpr,
    async () => {
      try {
        const fresh = await Channel.findById(channel._id);
        if (!fresh || !fresh.active) return;
        const plan = resolvePlan(fresh);
        for (const bucket of plan) {
          for (let i = 0; i < bucket.count; i++) {
            await runChannelPipeline(fresh, {
              trigger: 'cron',
              cronExpression: cronExpr,
              targetReadingMinutes: bucket.targetReadingMinutes,
            });
          }
        }
      } catch (err) {
        logger.error({ err, channel: channel.slug }, 'scheduler tick error');
      }
    },
    { timezone: channel.timezone || 'America/Sao_Paulo' } as any,
  );
}

export function rescheduleChannel(channel: ChannelDoc & { _id: any }): void {
  unscheduleChannel(String(channel._id));
  if (!channel.active) {
    logger.info({ channel: channel.slug }, 'channel inactive — not scheduled');
    return;
  }
  const expressions = buildCronList(channel);
  if (expressions.length === 0) {
    logger.warn(
      { channel: channel.slug, publishTimes: channel.publishTimes, weekdays: channel.publishWeekdays },
      'channel has no valid cron slots — not scheduled',
    );
    return;
  }
  const tz = channel.timezone || 'America/Sao_Paulo';
  const list: ChannelTask[] = expressions.map((expr) => ({
    channelId: String(channel._id),
    cronExpr: expr,
    timezone: tz,
    task: startTaskForSlot(channel, expr),
  }));
  tasks.set(String(channel._id), list);
  logger.info(
    {
      channel: channel.slug,
      timezone: tz,
      slots: list.map((t) => ({
        cron: t.cronExpr,
        nextRun: t.task.getNextRun()?.toISOString() ?? null,
      })),
      postsPlan: resolvePlan(channel),
    },
    'channel scheduled',
  );
}

export function unscheduleChannel(channelId: string): void {
  const list = tasks.get(channelId);
  if (!list) return;
  for (const t of list) t.task.stop();
  tasks.delete(channelId);
}

export async function bootstrapScheduler(): Promise<void> {
  const channels = await Channel.find({ active: true });
  for (const ch of channels) rescheduleChannel(ch as any);
  const summary = listScheduledChannels();
  const totalSlots = summary.reduce((n, c) => n + c.slots.length, 0);
  logger.info(
    { activeChannels: channels.length, totalSlots, summary },
    'scheduler bootstrapped',
  );
}

export function describeNextRuns(channelId: string, count = 3): { cron: string; next: string[] }[] {
  const list = tasks.get(channelId) ?? [];
  return list.map((t) => {
    // Primeiro pegamos o "real" next run direto do node-cron (autoritativo —
    // mesmo objeto que vai disparar). Depois usamos cron-parser, com a tz do
    // canal, pra projetar as ocorrências seguintes.
    const next: string[] = [];
    const realNext = t.task.getNextRun?.();
    if (realNext) next.push(realNext.toISOString());
    try {
      const it = CronExpressionParser.parse(t.cronExpr, { tz: t.timezone });
      // Avança o iterador até passar do realNext (se houver), pra não duplicar.
      if (realNext) {
        let cur: Date | null = null;
        while (!cur || cur.getTime() <= realNext.getTime()) cur = it.next().toDate();
      }
      while (next.length < count) next.push(it.next().toDate().toISOString());
    } catch {
      /* ignore parser errors — pelo menos o realNext já foi adicionado */
    }
    return { cron: t.cronExpr, next };
  });
}

/** Tarefas atualmente registradas. Útil pra rotas de diagnóstico. */
export function listScheduledChannels(): { channelId: string; slots: { cron: string; timezone: string; nextRun: string | null }[] }[] {
  return Array.from(tasks.entries()).map(([channelId, list]) => ({
    channelId,
    slots: list.map((t) => ({
      cron: t.cronExpr,
      timezone: t.timezone,
      nextRun: t.task.getNextRun()?.toISOString() ?? null,
    })),
  }));
}
