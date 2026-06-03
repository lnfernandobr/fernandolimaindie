import { z } from 'zod';
import { INSTAGRAM_LIMITS } from '../../constants/instagram.js';

const handleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(INSTAGRAM_LIMITS.HANDLE_MAX)
  .regex(/^[a-z0-9._-]+$/);

const colorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .optional();

const hashtag = z
  .string()
  .trim()
  .min(1)
  .max(INSTAGRAM_LIMITS.HASHTAG_MAX)
  .regex(/^#?[\p{L}0-9_]+$/u)
  .transform((v) => (v.startsWith('#') ? v : `#${v}`));

export const createChannelSchema = z.object({
  handle: handleSchema,
  displayName: z.string().trim().min(1).max(INSTAGRAM_LIMITS.NAME_MAX),
  niche: z.string().trim().max(INSTAGRAM_LIMITS.NAME_MAX).default(''),
  brief: z.string().trim().max(INSTAGRAM_LIMITS.BRIEF_MAX).default(''),
  tone: z.string().trim().max(INSTAGRAM_LIMITS.BRIEF_MAX).optional(),
  captionStyle: z.string().trim().max(INSTAGRAM_LIMITS.CAPTION_STYLE_MAX).optional(),
  imagePrompt: z.string().trim().max(INSTAGRAM_LIMITS.IMAGE_PROMPT_MAX).optional(),
  slidesPerCarousel: z.coerce
    .number()
    .int()
    .min(INSTAGRAM_LIMITS.SLIDES_MIN)
    .max(INSTAGRAM_LIMITS.SLIDES_MAX)
    .optional(),
  hashtagsPool: z.array(hashtag).max(INSTAGRAM_LIMITS.HASHTAGS_POOL_MAX).default([]),
  brandBg: colorSchema,
  brandFg: colorSchema,
  brandAccent: colorSchema,
  active: z.boolean().default(true),
});

export const updateChannelSchema = createChannelSchema.partial();

export const channelIdParamSchema = z.object({
  channelId: z.string().regex(/^[a-f0-9]{24}$/i),
});

export const listChannelsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(INSTAGRAM_LIMITS.PAGE_MAX)
    .default(INSTAGRAM_LIMITS.PAGE_DEFAULT),
});
