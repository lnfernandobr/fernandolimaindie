import { z } from 'zod';
import { slugSchema } from './common';
import { categoryDtoSchema } from './category';

export const postStatusSchema = z.enum(['draft', 'scheduled', 'published', 'archived']);
export type PostStatus = z.infer<typeof postStatusSchema>;

export const postFormatSchema = z.enum(['article', 'how-to', 'list', 'review', 'opinion']);
export type PostFormat = z.infer<typeof postFormatSchema>;

export const postImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  caption: z.string().optional(),
  credit: z.string().optional(),
});

export type PostImage = z.infer<typeof postImageSchema>;

export const faqEntrySchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const howToStepSchema = z.object({
  name: z.string().min(1),
  text: z.string().min(1),
  imageUrl: z.string().url().optional(),
});

export const referenceSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  publisher: z.string().optional(),
  accessedAt: z.string().optional(),
});

export const postInputSchema = z.object({
  channelId: z.string(),
  slug: slugSchema,
  title: z.string().min(1).max(200),
  excerpt: z.string().min(1).max(400),
  content: z.string().min(1),
  format: postFormatSchema.default('article'),
  status: postStatusSchema.default('draft'),
  categoryId: z.string(),
  tags: z.array(z.string()).default([]),
  coverImage: postImageSchema,
  gallery: z.array(postImageSchema).default([]),
  metaTitle: z.string().min(1).max(70),
  metaDescription: z.string().min(1).max(180),
  keywords: z.array(z.string()).default([]),
  faq: z.array(faqEntrySchema).default([]),
  howToSteps: z.array(howToStepSchema).default([]),
  references: z.array(referenceSchema).default([]),
  language: z.string().default('pt-BR'),
  wordCount: z.number().int().nonnegative().default(0),
  readingTimeMinutes: z.number().int().nonnegative().default(0),
  publishedAt: z.string().optional(),
  updatedAtContent: z.string().optional(),
  featured: z.boolean().default(false),
});

export type PostInput = z.infer<typeof postInputSchema>;

export const postDtoSchema = postInputSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  category: categoryDtoSchema.optional(),
});

export type PostDto = z.infer<typeof postDtoSchema>;

export const postListItemSchema = postDtoSchema.pick({
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImage: true,
  status: true,
  format: true,
  tags: true,
  metaTitle: true,
  metaDescription: true,
  language: true,
  wordCount: true,
  readingTimeMinutes: true,
  publishedAt: true,
  updatedAtContent: true,
  featured: true,
  channelId: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
  category: true,
});

export type PostListItem = z.infer<typeof postListItemSchema>;
