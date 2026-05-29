import { z } from 'zod';
import {
  SIGNAL_KINDS,
  SIGNAL_STATUSES,
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

const chunkInput = z.object({
  id: z.string().trim().min(1).max(LIMITS.CHUNK_ID_MAX),
  html: z.string().min(1).max(LIMITS.CHUNK_HTML_MAX),
});

const faqInput = z.object({
  question: z.string().trim().min(1).max(LIMITS.FAQ_QUESTION_MAX),
  answer: z.string().trim().min(1).max(LIMITS.FAQ_ANSWER_MAX),
});

export const createSignalSchema = z.object({
  slug: slugString,
  kind: z.enum(SIGNAL_KINDS),
  intent: z.enum(INTENT_KEYS),
  topicSlug: slugString,
  entitySlugs: z.array(slugString).max(LIMITS.ENTITY_SLUGS_MAX).default([]),
  title: z.string().trim().min(1).max(LIMITS.TITLE_MAX),
  answer: z.string().trim().min(1).max(LIMITS.ANSWER_MAX),
  summary: z.string().trim().min(1).max(LIMITS.SUMMARY_MAX),
  bodyHtml: z.string().min(1).max(LIMITS.BODY_MAX),
  chunks: z.array(chunkInput).max(LIMITS.CHUNKS_MAX).default([]),
  faq: z.array(faqInput).max(LIMITS.FAQ_MAX).default([]),
  relatedIntents: z
    .array(z.enum(INTENT_KEYS))
    .max(LIMITS.RELATED_INTENTS_MAX)
    .default([]),
  audioUrl: z.string().url().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  lang: z.string().trim().min(2).max(10).default(DEFAULT_LANG),
  status: z.enum(SIGNAL_STATUSES).default('published'),
  publishedAt: z.coerce.date().optional(),
});

export const updateSignalSchema = createSignalSchema.partial().omit({ slug: true });

export const signalSlugParamSchema = z.object({ slug: slugString });

export const listSignalsQuerySchema = z.object({
  kind: z.enum(SIGNAL_KINDS).optional(),
  intent: z.enum(INTENT_KEYS).optional(),
  topicSlug: slugString.optional(),
  entitySlug: slugString.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(LIMITS.PAGE_MAX).default(LIMITS.PAGE_DEFAULT),
});
