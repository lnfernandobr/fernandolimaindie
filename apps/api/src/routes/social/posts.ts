import { Router, type Router as RouterType } from 'express';
import { SocialPost } from '../../models/SocialPost.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { NotFound, BadRequest } from '../../utils/errors.js';
import { retrySocialPost } from '../../pipeline/social/runner.js';

export const socialPostsRouter: RouterType = Router();

socialPostsRouter.use(requireAuth);

socialPostsRouter.post(
  '/:id/retry',
  asyncHandler(async (req, res) => {
    const run = await retrySocialPost(String(req.params.id));
    const r: any = (run as any).toObject ? (run as any).toObject() : run;
    res.json({
      id: String(r._id),
      campaignId: String(r.campaignId),
      status: r.status,
      postId: r.postId ? String(r.postId) : undefined,
      error: r.error,
    });
  }),
);

socialPostsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { campaignId, status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (campaignId) filter.campaignId = campaignId;
    if (status) filter.status = status;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [items, total] = await Promise.all([
      SocialPost.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      SocialPost.countDocuments(filter),
    ]);

    res.json({
      items: items.map(postToDto),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.max(1, Math.ceil(total / limitNum)),
    });
  }),
);

socialPostsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const post = await SocialPost.findById(req.params.id).lean();
    if (!post) throw NotFound('Post not found');
    res.json(postToDto(post));
  }),
);

socialPostsRouter.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const { status } = req.body as { status: string };
    const allowed = ['pending_review', 'published', 'failed'];
    if (!allowed.includes(status)) throw BadRequest(`Status must be one of: ${allowed.join(', ')}`);

    const update: Record<string, unknown> = { status };
    if (status === 'published') update.publishedAt = new Date();
    if (status === 'failed') update.failedAt = new Date();

    const post = await SocialPost.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!post) throw NotFound('Post not found');
    res.json(postToDto(post));
  }),
);

socialPostsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const post = await SocialPost.findByIdAndDelete(req.params.id);
    if (!post) throw NotFound('Post not found');
    res.status(204).end();
  }),
);

function postToDto(p: any) {
  return {
    id: String(p._id),
    campaignId: String(p.campaignId),
    platform: p.platform,
    status: p.status,
    topic: p.topic,
    caption: p.caption ?? '',
    hashtags: p.hashtags ?? [],
    images: (p.images ?? []).map((img: any) => ({
      url: img.url,
      alt: img.alt,
      width: img.width,
      height: img.height,
      prompt: img.prompt,
    })),
    platformPostId: p.platformPostId,
    platformShareUrl: p.platformShareUrl,
    notificationSentAt: p.notificationSentAt ? new Date(p.notificationSentAt).toISOString() : undefined,
    publishedAt: p.publishedAt ? new Date(p.publishedAt).toISOString() : undefined,
    failedAt: p.failedAt ? new Date(p.failedAt).toISOString() : undefined,
    failureReason: p.failureReason,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
  };
}
