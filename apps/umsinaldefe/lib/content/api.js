import { z } from 'zod';
import { paginatedSchema, signalSchema, signalSummarySchema } from './types.js';
import { getPublishedSignals } from './signals-store.js';

/**
 * Posts (signals) vêm de arquivos estáticos em content/signals/ (ver
 * signals-store.js). Sem API, sem banco: o site é 100% estático.
 */

export const getSignal = async (slug) => {
  const found = getPublishedSignals().find((s) => s.slug === slug);
  if (!found) {
    const err = new Error(`Signal not found: ${slug}`);
    err.status = 404;
    throw err;
  }
  return signalSchema.parse(found);
};

export const listSignals = async ({ kind, intent, topicSlug, entitySlug, page = 1, limit = 20 } = {}) => {
  let items = getPublishedSignals();
  if (kind) items = items.filter((s) => s.kind === kind);
  if (intent) items = items.filter((s) => s.intent === intent);
  if (topicSlug) items = items.filter((s) => s.topicSlug === topicSlug);
  if (entitySlug) items = items.filter((s) => (s.entitySlugs ?? []).includes(entitySlug));
  items = [...items].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  const total = items.length;
  const start = (page - 1) * limit;
  const pageItems = items.slice(start, start + limit);

  return paginatedSchema(signalSummarySchema).parse({
    items: pageItems,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit) || 1,
  });
};

export const getRelatedSignals = async (slug) => {
  const all = getPublishedSignals();
  const doc = all.find((s) => s.slug === slug);
  if (!doc) return [];

  const related = all
    .filter((s) => s.slug !== slug)
    .filter((s) =>
      s.topicSlug === doc.topicSlug ||
      (doc.entitySlugs ?? []).some((e) => (s.entitySlugs ?? []).includes(e)) ||
      (doc.relatedIntents ?? []).includes(s.intent),
    )
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 6);

  return z.array(signalSummarySchema).parse(related);
};
