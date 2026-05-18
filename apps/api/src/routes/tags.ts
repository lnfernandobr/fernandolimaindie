import { Router } from 'express';
import { tagInputSchema, paginationQuerySchema } from '@fernandolimaindie/shared';
import { Tag } from '../models/Tag.js';
import { Conflict, NotFound } from '../utils/errors.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { tagToDto } from '../utils/dto.js';

export const tagsRouter: Router = Router();

tagsRouter.use(requireAuth);

tagsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, q } = paginationQuerySchema.parse(req.query);
    const channelId = (req.query.channelId as string) || undefined;
    const filter: Record<string, unknown> = {};
    if (channelId) filter.channelId = channelId;
    if (q) filter.name = new RegExp(q, 'i');
    const [items, total] = await Promise.all([
      Tag.find(filter)
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Tag.countDocuments(filter),
    ]);
    res.json({
      items: items.map((t) => tagToDto(t as any)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  }),
);

tagsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = tagInputSchema.parse(req.body);
    const exists = await Tag.findOne({ channelId: data.channelId, slug: data.slug }).lean();
    if (exists) throw Conflict(`Tag "${data.slug}" already exists`);
    const created = await Tag.create(data);
    res.status(201).json(tagToDto(created as any));
  }),
);

tagsRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = tagInputSchema.parse(req.body);
    const tag = await Tag.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!tag) throw NotFound('Tag not found');
    res.json(tagToDto(tag as any));
  }),
);

tagsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const tag = await Tag.findByIdAndDelete(req.params.id);
    if (!tag) throw NotFound('Tag not found');
    res.status(204).end();
  }),
);
