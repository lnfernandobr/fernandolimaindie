import { Router } from 'express';
import { postInputSchema, paginationQuerySchema } from '@fernandolimaindie/shared';
import { Post } from '../models/Post.js';
import { Category } from '../models/Category.js';
import { Conflict, NotFound } from '../utils/errors.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { postToDto } from '../utils/dto.js';
import { countWords, readingTimeMinutes } from '../utils/readingTime.js';
import { revalidateChannel } from '../services/revalidate.js';

export const postsRouter: Router = Router();

postsRouter.use(requireAuth);

postsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, q } = paginationQuerySchema.parse(req.query);
    const channelId = (req.query.channelId as string) || undefined;
    const status = (req.query.status as string) || undefined;
    const filter: Record<string, unknown> = {};
    if (channelId) filter.channelId = channelId;
    if (status) filter.status = status;
    if (q) filter.$text = { $search: q };
    const [items, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Post.countDocuments(filter),
    ]);
    res.json({
      items: items.map((p) => postToDto(p as any)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  }),
);

postsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = postInputSchema.parse(req.body);
    const exists = await Post.findOne({ channelId: data.channelId, slug: data.slug }).lean();
    if (exists) throw Conflict(`Post "${data.slug}" already exists`);
    const wordCount = countWords(data.content);
    const created = await Post.create({
      ...data,
      wordCount,
      readingTimeMinutes: readingTimeMinutes(wordCount),
      publishedAt: data.status === 'published' ? new Date(data.publishedAt ?? Date.now()) : data.publishedAt,
    });
    if (created.status === 'published') {
      void revalidateChannel(String(created.channelId), created.slug);
    }
    res.status(201).json(postToDto(created as any));
  }),
);

postsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id).lean();
    if (!post) throw NotFound('Post not found');
    const category = await Category.findById(post.categoryId).lean();
    res.json(postToDto(post as any, { category: category as any }));
  }),
);

postsRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = postInputSchema.parse(req.body);
    const wordCount = countWords(data.content);
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        ...data,
        wordCount,
        readingTimeMinutes: readingTimeMinutes(wordCount),
        updatedAtContent: new Date(),
      },
      { new: true },
    );
    if (!post) throw NotFound('Post not found');
    if (post.status === 'published') {
      void revalidateChannel(String(post.channelId), post.slug);
    }
    res.json(postToDto(post as any));
  }),
);

postsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) throw NotFound('Post not found');
    void revalidateChannel(String(post.channelId), post.slug);
    res.status(204).end();
  }),
);
