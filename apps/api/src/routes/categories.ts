import { Router } from 'express';
import { categoryInputSchema, paginationQuerySchema } from '@fernandolimaindie/shared';
import { Category } from '../models/Category.js';
import { Conflict, NotFound } from '../utils/errors.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { categoryToDto } from '../utils/dto.js';

export const categoriesRouter: Router = Router();

categoriesRouter.use(requireAuth);

categoriesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, q } = paginationQuerySchema.parse(req.query);
    const channelId = (req.query.channelId as string) || undefined;
    const filter: Record<string, unknown> = {};
    if (channelId) filter.channelId = channelId;
    if (q) filter.name = new RegExp(q, 'i');
    const [items, total] = await Promise.all([
      Category.find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Category.countDocuments(filter),
    ]);
    res.json({
      items: items.map((c) => categoryToDto(c as any)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  }),
);

categoriesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = categoryInputSchema.parse(req.body);
    const exists = await Category.findOne({ channelId: data.channelId, slug: data.slug }).lean();
    if (exists) throw Conflict(`Category "${data.slug}" already exists in channel`);
    const created = await Category.create(data);
    res.status(201).json(categoryToDto(created as any));
  }),
);

categoriesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id).lean();
    if (!category) throw NotFound('Category not found');
    res.json(categoryToDto(category as any));
  }),
);

categoriesRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = categoryInputSchema.parse(req.body);
    const category = await Category.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!category) throw NotFound('Category not found');
    res.json(categoryToDto(category as any));
  }),
);

categoriesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) throw NotFound('Category not found');
    res.status(204).end();
  }),
);
