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

const verseSchema = z.object({
  ref: z.string().trim().min(1).max(LIMITS.VERSE_REF_MAX),
  text: z.string().trim().min(1).max(LIMITS.VERSE_TEXT_MAX),
});

export const generatedContentSchema = z.object({
  title: z.string().trim().min(1).max(LIMITS.TITLE_MAX),
  answer: z.string().trim().min(1).max(LIMITS.ANSWER_MAX),
  summary: z.string().trim().min(1).max(LIMITS.SUMMARY_MAX),
  bodyHtml: z.string().min(1).max(LIMITS.BODY_MAX),
  chunks: z.array(chunkSchema).max(LIMITS.CHUNKS_MAX).default([]),
  faq: z.array(faqSchema).min(1).max(LIMITS.FAQ_MAX),
  verses: z.array(verseSchema).max(LIMITS.VERSES_MAX).default([]),
  category: z.string().trim().max(LIMITS.CATEGORY_MAX).optional(),
  relatedIntents: z.array(z.enum(INTENT_KEYS)).min(1).max(LIMITS.RELATED_INTENTS_MAX),
});

const CHUNK_ITEM = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'html'],
  properties: {
    id: { type: 'string', pattern: SLUG_PATTERN.source, maxLength: LIMITS.CHUNK_ID_MAX },
    html: { type: 'string', minLength: 1, maxLength: LIMITS.CHUNK_HTML_MAX },
  },
};

const FAQ_ITEM = {
  type: 'object',
  additionalProperties: false,
  required: ['question', 'answer'],
  properties: {
    question: { type: 'string', minLength: 1, maxLength: LIMITS.FAQ_QUESTION_MAX },
    answer: { type: 'string', minLength: 1, maxLength: LIMITS.FAQ_ANSWER_MAX },
  },
};

const VERSE_ITEM = {
  type: 'object',
  additionalProperties: false,
  required: ['ref', 'text'],
  properties: {
    ref: { type: 'string', minLength: 1, maxLength: LIMITS.VERSE_REF_MAX },
    text: { type: 'string', minLength: 1, maxLength: LIMITS.VERSE_TEXT_MAX },
  },
};

/**
 * JSON Schema (strict) do conteudo gerado, por signalKind.
 * - verse_collection: exige `verses` (5+); chunks podem vir vazios.
 * - demais kinds: exigem `chunks` (2+); sem `verses`.
 * Em strict mode todo property listado entra em `required`.
 */
export const buildContentJsonSchema = (signalKind) => {
  const isVerseCollection = signalKind === 'verse_collection';
  const chunksMin = isVerseCollection || signalKind === 'article' ? 0 : 2;
  const properties = {
    title: { type: 'string', minLength: 1, maxLength: LIMITS.TITLE_MAX },
    answer: { type: 'string', minLength: 1, maxLength: LIMITS.ANSWER_MAX },
    summary: { type: 'string', minLength: 1, maxLength: LIMITS.SUMMARY_MAX },
    bodyHtml: { type: 'string', minLength: 1, maxLength: LIMITS.BODY_MAX },
    chunks: {
      type: 'array',
      minItems: chunksMin,
      maxItems: LIMITS.CHUNKS_MAX,
      items: CHUNK_ITEM,
    },
    faq: { type: 'array', minItems: 1, maxItems: LIMITS.FAQ_MAX, items: FAQ_ITEM },
    relatedIntents: {
      type: 'array',
      minItems: 1,
      maxItems: LIMITS.RELATED_INTENTS_MAX,
      items: { type: 'string', enum: [...INTENT_KEYS] },
    },
  };
  if (isVerseCollection) {
    properties.verses = { type: 'array', minItems: 5, maxItems: LIMITS.VERSES_MAX, items: VERSE_ITEM };
  }
  return {
    type: 'object',
    additionalProperties: false,
    required: Object.keys(properties),
    properties,
  };
};

export const seedDescriptorSchema = z.object({
  seedSlug: slugString,
  seedKind: z.enum(SEED_KINDS),
  signalKind: z.string(),
  intent: z.enum(INTENT_KEYS),
  topicSlug: slugString,
  entitySlugs: z.array(slugString).default([]),
  priority: z.number().int().min(1).default(3),
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
