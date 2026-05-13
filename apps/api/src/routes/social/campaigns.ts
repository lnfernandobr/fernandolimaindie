import { Router, type Router as RouterType } from 'express';
import { socialCampaignInputSchema } from '@bn/shared';
import { SocialCampaign } from '../../models/SocialCampaign.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { NotFound } from '../../utils/errors.js';
import { rescheduleSocialCampaign, unscheduleSocialCampaign, describeSocialNextRuns } from '../../scheduler/socialScheduler.js';
import { runSocialPipeline } from '../../pipeline/social/runner.js';

export const socialCampaignsRouter: RouterType = Router();

socialCampaignsRouter.use(requireAuth);

socialCampaignsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const items = await SocialCampaign.find().sort({ createdAt: -1 }).lean();
    res.json({ items: items.map(campaignToDto), total: items.length });
  }),
);

socialCampaignsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = socialCampaignInputSchema.parse(req.body);
    const created = await SocialCampaign.create(data);
    rescheduleSocialCampaign(created as any);
    res.status(201).json(campaignToDto(created.toObject()));
  }),
);

socialCampaignsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const campaign = await SocialCampaign.findById(req.params.id).lean();
    if (!campaign) throw NotFound('Campaign not found');
    res.json(campaignToDto(campaign));
  }),
);

socialCampaignsRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = socialCampaignInputSchema.parse(req.body);
    const campaign = await SocialCampaign.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!campaign) throw NotFound('Campaign not found');
    rescheduleSocialCampaign(campaign as any);
    res.json(campaignToDto(campaign.toObject()));
  }),
);

socialCampaignsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const campaign = await SocialCampaign.findByIdAndDelete(req.params.id);
    if (!campaign) throw NotFound('Campaign not found');
    unscheduleSocialCampaign(String(campaign._id));
    res.status(204).end();
  }),
);

socialCampaignsRouter.post(
  '/:id/trigger',
  asyncHandler(async (req, res) => {
    const campaign = await SocialCampaign.findById(req.params.id);
    if (!campaign) throw NotFound('Campaign not found');
    const run = (await runSocialPipeline(campaign as any, { trigger: 'manual' })) as any;
    res.json(runToDto(run.toObject ? run.toObject() : run));
  }),
);

socialCampaignsRouter.get(
  '/:id/next-runs',
  asyncHandler(async (req, res) => {
    const campaign = await SocialCampaign.findById(req.params.id).lean();
    if (!campaign) throw NotFound('Campaign not found');
    const items = describeSocialNextRuns(String(campaign._id));
    res.json({ items });
  }),
);

function campaignToDto(c: any) {
  return {
    id: String(c._id),
    name: c.name,
    niche: c.niche,
    language: c.language ?? 'pt-BR',
    timezone: c.timezone ?? 'America/Sao_Paulo',
    active: c.active,
    accountId: String(c.accountId),
    imageCount: c.imageCount ?? 5,
    notificationEmail: c.notificationEmail,
    publishTimes: c.publishTimes ?? [],
    publishWeekdays: c.publishWeekdays ?? [0, 1, 2, 3, 4, 5, 6],
    promptConfig: {
      contentTypes: c.promptConfig?.contentTypes ?? ['educational', 'listicle'],
      visualStyle: c.promptConfig?.visualStyle ?? 'vibrant editorial photography, high contrast',
      tone: c.promptConfig?.tone ?? 'educational and inspiring',
      targetAudience: c.promptConfig?.targetAudience ?? '',
      extraContext: c.promptConfig?.extraContext ?? '',
    },
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : new Date().toISOString(),
  };
}

function runToDto(r: any) {
  return {
    id: String(r._id),
    campaignId: String(r.campaignId),
    trigger: r.trigger,
    status: r.status,
    startedAt: r.startedAt ? new Date(r.startedAt).toISOString() : new Date().toISOString(),
    finishedAt: r.finishedAt ? new Date(r.finishedAt).toISOString() : undefined,
    durationMs: r.durationMs,
    steps: (r.steps ?? []).map((s: any) => ({
      name: s.name,
      status: s.status,
      startedAt: s.startedAt ? new Date(s.startedAt).toISOString() : undefined,
      finishedAt: s.finishedAt ? new Date(s.finishedAt).toISOString() : undefined,
      durationMs: s.durationMs,
      message: s.message,
    })),
    postId: r.postId ? String(r.postId) : undefined,
    error: r.error,
  };
}
