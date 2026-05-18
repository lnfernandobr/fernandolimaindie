import cron, { type ScheduledTask } from 'node-cron';
import { CronExpressionParser } from 'cron-parser';
import { publishTimesToCron } from '@fernandolimaindie/shared';
import { SocialCampaign, type SocialCampaignDoc } from '../models/SocialCampaign.js';
import { logger } from '../config/logger.js';
import { runSocialPipeline } from '../pipeline/social/runner.js';

interface CampaignTask {
  campaignId: string;
  cronExpr: string;
  timezone: string;
  task: ScheduledTask;
}

const tasks = new Map<string, CampaignTask[]>();

function buildCronList(campaign: SocialCampaignDoc): string[] {
  const times = (campaign.publishTimes ?? []).filter(Boolean);
  const weekdays = campaign.publishWeekdays?.length ? campaign.publishWeekdays : [0, 1, 2, 3, 4, 5, 6];
  return publishTimesToCron(times, weekdays).filter((c) => cron.validate(c));
}

function startTaskForSlot(campaign: SocialCampaignDoc & { _id: any }, cronExpr: string): ScheduledTask {
  return cron.schedule(
    cronExpr,
    async () => {
      try {
        const fresh = await SocialCampaign.findById(campaign._id);
        if (!fresh || !fresh.active) return;
        await runSocialPipeline(fresh as any, { trigger: 'cron', cronExpression: cronExpr });
      } catch (err) {
        logger.error({ err, campaign: campaign.name }, 'social scheduler tick error');
      }
    },
    { timezone: campaign.timezone || 'America/Sao_Paulo' } as any,
  );
}

export function rescheduleSocialCampaign(campaign: SocialCampaignDoc & { _id: any }): void {
  unscheduleSocialCampaign(String(campaign._id));
  if (!campaign.active) return;

  const expressions = buildCronList(campaign);
  if (expressions.length === 0) {
    logger.warn({ campaign: campaign.name }, 'social campaign has no valid cron slots');
    return;
  }

  const tz = campaign.timezone || 'America/Sao_Paulo';
  const list: CampaignTask[] = expressions.map((expr) => ({
    campaignId: String(campaign._id),
    cronExpr: expr,
    timezone: tz,
    task: startTaskForSlot(campaign, expr),
  }));
  tasks.set(String(campaign._id), list);

  logger.info(
    {
      campaign: campaign.name,
      timezone: tz,
      slots: list.map((t) => ({ cron: t.cronExpr, nextRun: t.task.getNextRun()?.toISOString() ?? null })),
    },
    'social campaign scheduled',
  );
}

export function unscheduleSocialCampaign(campaignId: string): void {
  const list = tasks.get(campaignId);
  if (!list) return;
  for (const t of list) t.task.stop();
  tasks.delete(campaignId);
}

export async function bootstrapSocialScheduler(): Promise<void> {
  const campaigns = await SocialCampaign.find({ active: true });
  for (const c of campaigns) rescheduleSocialCampaign(c as any);
  const total = Array.from(tasks.values()).reduce((n, l) => n + l.length, 0);
  logger.info({ activeCampaigns: campaigns.length, totalSlots: total }, 'social scheduler bootstrapped');
}

export function describeSocialNextRuns(campaignId: string, count = 3): { cron: string; next: string[] }[] {
  const list = tasks.get(campaignId) ?? [];
  return list.map((t) => {
    const next: string[] = [];
    const realNext = t.task.getNextRun?.();
    if (realNext) next.push(realNext.toISOString());
    try {
      const it = CronExpressionParser.parse(t.cronExpr, { tz: t.timezone });
      if (realNext) {
        let cur: Date | null = null;
        while (!cur || cur.getTime() <= realNext.getTime()) cur = it.next().toDate();
      }
      while (next.length < count) next.push(it.next().toDate().toISOString());
    } catch {}
    return { cron: t.cronExpr, next };
  });
}
