import { Router } from 'express';
import { DEFAULT_POSTS_PLAN, paginationQuerySchema, type PostPlanItem } from '@bn/shared';
import { Run } from '../models/Run.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { runToDto } from '../utils/dto.js';
import { runChannelPipeline } from '../pipeline/runner.js';
import { Channel, type ChannelDoc } from '../models/Channel.js';
import { NotFound } from '../utils/errors.js';

/**
 * Resolve o postsPlan do canal aplicando os fallbacks já existentes no
 * scheduler. Mantemos o trigger manual com o mesmo comportamento do cron:
 * respeitar `targetReadingMinutes` por bucket.
 */
function resolvePlan(channel: ChannelDoc): PostPlanItem[] {
  const plan = (channel.postsPlan ?? []).filter(
    (b: any) => b && Number.isFinite(b.count) && Number.isFinite(b.targetReadingMinutes),
  );
  if (plan.length > 0) return plan as PostPlanItem[];
  if (Number.isFinite((channel as any).postsPerSlot) && (channel as any).postsPerSlot > 0) {
    return [{ count: (channel as any).postsPerSlot, targetReadingMinutes: 8 }];
  }
  return DEFAULT_POSTS_PLAN;
}

export const runsRouter: Router = Router();

runsRouter.use(requireAuth);

runsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit } = paginationQuerySchema.parse(req.query);
    const channelId = (req.query.channelId as string) || undefined;
    const filter: Record<string, unknown> = {};
    if (channelId) filter.channelId = channelId;
    const [items, total] = await Promise.all([
      Run.find(filter)
        .sort({ startedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Run.countDocuments(filter),
    ]);
    res.json({
      items: items.map((r) => runToDto(r as any)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  }),
);

runsRouter.post(
  '/trigger/:channelId',
  asyncHandler(async (req, res) => {
    const channel = await Channel.findById(req.params.channelId);
    if (!channel) throw NotFound('Channel not found');

    // Trigger manual respeita o postsPlan exatamente como o cron faz: cada
    // bucket dispara N execuções com o targetReadingMinutes correto. Sem isso,
    // a IA escrevia até 6500 palavras ignorando o limite configurado.
    const plan = resolvePlan(channel);
    const runs = [];
    for (const bucket of plan) {
      for (let i = 0; i < bucket.count; i++) {
        const run = await runChannelPipeline(channel, {
          trigger: 'manual',
          targetReadingMinutes: bucket.targetReadingMinutes,
        });
        runs.push(run);
      }
    }
    // Resposta mantém shape de "uma run" — devolvemos a primeira pra preservar
    // o contrato do botão "Disparar" no admin (loading/feedback).
    res.status(202).json(runToDto(runs[0] as any));
  }),
);
