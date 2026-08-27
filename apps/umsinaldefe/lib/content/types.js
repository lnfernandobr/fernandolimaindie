import { z } from 'zod';

export const SIGNAL_KINDS = [
  'prayer',
  'psalm',
  'reflection',
  'verse',
  'devotional',
  'novena',
  'article',
  'verse_collection',
];

export const INTENT_KEYS = [
  'anxiety',
  'sleep',
  'fear',
  'gratitude',
  'protection',
  'faith',
  'hope',
  'family',
  'finances',
  'grief',
  'morning',
  'night',
  'healing',
  'forgiveness',
];

const chunkSchema = z.object({
  id: z.string(),
  html: z.string(),
});

const faqSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const verseSchema = z.object({
  ref: z.string(),
  text: z.string(),
});

export const signalSchema = z.object({
  id: z.string(),
  slug: z.string(),
  kind: z.enum(SIGNAL_KINDS),
  intent: z.enum(INTENT_KEYS),
  topicSlug: z.string(),
  entitySlugs: z.array(z.string()),
  title: z.string(),
  answer: z.string(),
  summary: z.string(),
  bodyHtml: z.string(),
  chunks: z.array(chunkSchema),
  faq: z.array(faqSchema),
  verses: z.array(verseSchema).default([]),
  category: z.string().nullable().optional(),
  relatedIntents: z.array(z.string()),
  audioUrl: z.string().nullable(),
  imageUrl: z.string().nullable(),
  lang: z.string(),
  status: z.string(),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
});

export const signalSummarySchema = z.object({
  slug: z.string(),
  kind: z.enum(SIGNAL_KINDS),
  intent: z.enum(INTENT_KEYS),
  topicSlug: z.string(),
  category: z.string().nullable().optional(),
  title: z.string(),
  answer: z.string(),
  imageUrl: z.string().nullable(),
  audioUrl: z.string().nullable(),
  publishedAt: z.coerce.date(),
});

export const paginatedSchema = (itemSchema) =>
  z.object({
    items: z.array(itemSchema),
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  });
