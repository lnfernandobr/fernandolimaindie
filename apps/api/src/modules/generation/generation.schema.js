import { z } from 'zod';
import {
  INTENT_KEYS,
  LIMITS,
  SLUG_PATTERN,
} from '../../constants/content.js';
import {
  SEED_KINDS,
  GENERATION_DEFAULTS,
} from '../../constants/generation.js';

const slugString = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(LIMITS.SLUG_MAX)
  .regex(SLUG_PATTERN);

const chunkSchema = z.object({
  id: z.string().trim().min(1).max(LIMITS.CHUNK_ID_MAX).regex(SLUG_PATTERN),
  html: z.string().min(1).max(LIMITS.CHUNK_HTML_MAX),
});

const faqSchema = z.object({
  question: z.string().trim().min(1).max(LIMITS.FAQ_QUESTION_MAX),
  answer: z.string().trim().min(1).max(LIMITS.FAQ_ANSWER_MAX),
});

export const generatedContentSchema = z.object({
  title: z.string().trim().min(1).max(LIMITS.TITLE_MAX),
  answer: z.string().trim().min(1).max(LIMITS.ANSWER_MAX),
  summary: z.string().trim().min(1).max(LIMITS.SUMMARY_MAX),
  bodyHtml: z.string().min(1).max(LIMITS.BODY_MAX),
  chunks: z.array(chunkSchema).min(2).max(LIMITS.CHUNKS_MAX),
  faq: z.array(faqSchema).min(1).max(LIMITS.FAQ_MAX),
  relatedIntents: z.array(z.enum(INTENT_KEYS)).min(1).max(LIMITS.RELATED_INTENTS_MAX),
});

export const generatedContentJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'answer', 'summary', 'bodyHtml', 'chunks', 'faq', 'relatedIntents'],
  properties: {
    title: { type: 'string', minLength: 1, maxLength: LIMITS.TITLE_MAX },
    answer: { type: 'string', minLength: 1, maxLength: LIMITS.ANSWER_MAX },
    summary: { type: 'string', minLength: 1, maxLength: LIMITS.SUMMARY_MAX },
    bodyHtml: { type: 'string', minLength: 1, maxLength: LIMITS.BODY_MAX },
    chunks: {
      type: 'array',
      minItems: 2,
      maxItems: LIMITS.CHUNKS_MAX,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'html'],
        properties: {
          id: { type: 'string', pattern: SLUG_PATTERN.source, maxLength: LIMITS.CHUNK_ID_MAX },
          html: { type: 'string', minLength: 1, maxLength: LIMITS.CHUNK_HTML_MAX },
        },
      },
    },
    faq: {
      type: 'array',
      minItems: 1,
      maxItems: LIMITS.FAQ_MAX,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['question', 'answer'],
        properties: {
          question: { type: 'string', minLength: 1, maxLength: LIMITS.FAQ_QUESTION_MAX },
          answer: { type: 'string', minLength: 1, maxLength: LIMITS.FAQ_ANSWER_MAX },
        },
      },
    },
    relatedIntents: {
      type: 'array',
      minItems: 1,
      maxItems: LIMITS.RELATED_INTENTS_MAX,
      items: { type: 'string', enum: [...INTENT_KEYS] },
    },
  },
};

export const seedDescriptorSchema = z.object({
  seedSlug: slugString,
  seedKind: z.enum(SEED_KINDS),
  signalKind: z.string(),
  intent: z.enum(INTENT_KEYS),
  topicSlug: slugString,
  entitySlugs: z.array(slugString).default([]),
  subject: z.record(z.string(), z.unknown()),
});

export const runOneSchema = z.object({
  seedSlug: slugString,
  model: z.string().optional(),
  force: z.boolean().default(false),
});

export const runBatchSchema = z.object({
  seedKind: z.enum(SEED_KINDS).optional(),
  limit: z
    .coerce.number()
    .int()
    .min(1)
    .max(GENERATION_DEFAULTS.BATCH_LIMIT_MAX)
    .default(GENERATION_DEFAULTS.BATCH_LIMIT),
  model: z.string().optional(),
  force: z.boolean().default(false),
});
