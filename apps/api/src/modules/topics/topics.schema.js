import { z } from 'zod';
import {
  INTENT_KEYS,
  LIMITS,
  SLUG_PATTERN,
  DEFAULT_LANG,
} from '../../constants/soulsignal.js';

const slugString = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(LIMITS.SLUG_MAX)
  .regex(SLUG_PATTERN);

export const createTopicSchema = z.object({
  slug: slugString,
  name: z.string().trim().min(1).max(LIMITS.TITLE_MAX),
  intent: z.enum(INTENT_KEYS),
  description: z.string().trim().min(1).max(LIMITS.SUMMARY_MAX),
  answer: z.string().trim().min(1).max(LIMITS.ANSWER_MAX),
  bodyHtml: z.string().max(LIMITS.BODY_MAX).default(''),
  relatedTopicSlugs: z.array(slugString).max(LIMITS.RELATED_INTENTS_MAX).default([]),
  heroImageUrl: z.string().url().optional().nullable(),
  lang: z.string().trim().min(2).max(10).default(DEFAULT_LANG),
});

export const updateTopicSchema = createTopicSchema.partial().omit({ slug: true });

export const topicSlugParamSchema = z.object({ slug: slugString });

export const listTopicsQuerySchema = z.object({
  intent: z.enum(INTENT_KEYS).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(LIMITS.PAGE_MAX).default(LIMITS.PAGE_DEFAULT),
});
