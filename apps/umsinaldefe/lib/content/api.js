import { z } from 'zod';
import {
  entitySchema,
  paginatedSchema,
  signalSchema,
  signalSummarySchema,
  topicSchema,
  topicSummarySchema,
} from './types.js';
import { SIGNALS, TOPIC_LIST, ENTITY_LIST } from './dataset.js';

/**
 * Static content store.
 *
 * The site previously fetched every page from an external content API, which
 * is not deployed/seeded, so content pages 404'd. Content now lives in
 * lib/content/dataset.js and is served from here. These functions keep the
 * exact signatures and return shapes of the old API client (validated by the
 * same zod schemas), so no page or component needs to change.
 */

const toSummary = (s) => ({
  slug: s.slug,
  kind: s.kind,
  intent: s.intent,
  topicSlug: s.topicSlug,
  title: s.title,
  answer: s.answer,
  imageUrl: s.imageUrl,
  audioUrl: s.audioUrl,
  publishedAt: s.publishedAt,
});

const byNewest = (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt);

export const getSignal = async (slug) => {
  const found = SIGNALS.find((s) => s.slug === slug);
  if (!found) throw new Error(`Signal not found: ${slug}`);
  return signalSchema.parse(found);
};

export const listSignals = async (params = {}) => {
  const { intent, kind, topicSlug, page = 1, limit = 20 } = params;

  let items = SIGNALS.filter((s) => {
    if (intent && s.intent !== intent) return false;
    if (kind && s.kind !== kind) return false;
    if (topicSlug && s.topicSlug !== topicSlug) return false;
    return true;
  });

  items = [...items].sort(byNewest);

  const total = items.length;
  const lim = Number(limit) || 20;
  const pg = Number(page) || 1;
  const start = (pg - 1) * lim;
  const pageItems = items.slice(start, start + lim).map(toSummary);

  return paginatedSchema(signalSummarySchema).parse({
    items: pageItems,
    page: pg,
    limit: lim,
    total,
    pages: Math.max(1, Math.ceil(total / lim)),
  });
};

export const getRelatedSignals = async (slug) => {
  const current = SIGNALS.find((s) => s.slug === slug);
  if (!current) return [];

  const scored = SIGNALS.filter((s) => s.slug !== slug)
    .map((s) => {
      let score = 0;
      if (s.topicSlug === current.topicSlug) score += 3;
      if (s.intent === current.intent) score += 2;
      if (current.relatedIntents?.includes(s.intent)) score += 1;
      return { s, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || byNewest(a.s, b.s))
    .slice(0, 4)
    .map((x) => toSummary(x.s));

  return z.array(signalSummarySchema).parse(scored);
};

export const getTopic = async (slug) => {
  const found = TOPIC_LIST.find((t) => t.slug === slug);
  if (!found) throw new Error(`Topic not found: ${slug}`);
  return topicSchema.parse(found);
};

export const listTopics = async (params = {}) => {
  const { intent, page = 1, limit = 50 } = params;
  let items = TOPIC_LIST.filter((t) => (intent ? t.intent === intent : true));
  const total = items.length;
  const lim = Number(limit) || 50;
  const pg = Number(page) || 1;
  const start = (pg - 1) * lim;
  const pageItems = items.slice(start, start + lim).map((t) => ({
    slug: t.slug,
    name: t.name,
    intent: t.intent,
    description: t.description,
    heroImageUrl: t.heroImageUrl,
  }));
  return paginatedSchema(topicSummarySchema).parse({
    items: pageItems,
    page: pg,
    limit: lim,
    total,
    pages: Math.max(1, Math.ceil(total / lim)),
  });
};

export const getEntity = async (slug) => {
  const found = ENTITY_LIST.find((e) => e.slug === slug);
  if (!found) throw new Error(`Entity not found: ${slug}`);
  return entitySchema.parse(found);
};

export const listEntities = async (params = {}) => {
  const { page = 1, limit = 50 } = params;
  const total = ENTITY_LIST.length;
  const lim = Number(limit) || 50;
  const pg = Number(page) || 1;
  const start = (pg - 1) * lim;
  const pageItems = ENTITY_LIST.slice(start, start + lim);
  return paginatedSchema(entitySchema).parse({
    items: pageItems,
    page: pg,
    limit: lim,
    total,
    pages: Math.max(1, Math.ceil(total / lim)),
  });
};
