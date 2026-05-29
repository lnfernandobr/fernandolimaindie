import { conflict, notFound } from '../../errors/factories.js';
import {
  MONGO_DUPLICATE_KEY,
  SIGNAL_ERRORS,
} from '../../constants/content.js';
import {
  countSignals,
  createSignal as insertSignal,
  findSignalBySlug,
  findSignalBySlugAnyStatus,
  findRelatedSignals as queryRelatedSignals,
  listSignals as queryListSignals,
  updateSignalBySlug as patchSignalBySlug,
} from './signals.repository.js';
import { toPublicSignal, toSignalSummary } from './signals.dto.js';

const buildFilter = ({ kind, intent, topicSlug, entitySlug }) => {
  const filter = {};
  if (kind) filter.kind = kind;
  if (intent) filter.intent = intent;
  if (topicSlug) filter.topicSlug = topicSlug;
  if (entitySlug) filter.entitySlugs = entitySlug;
  return filter;
};

export const getSignalBySlug = async (slug) => {
  const doc = await findSignalBySlug(slug);
  if (!doc) throw notFound(SIGNAL_ERRORS.NOT_FOUND);
  return toPublicSignal(doc);
};

export const listPublishedSignals = async ({ kind, intent, topicSlug, entitySlug, page, limit }) => {
  const filter = buildFilter({ kind, intent, topicSlug, entitySlug });
  const skip = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    queryListSignals({ filter, skip, limit }),
    countSignals(filter),
  ]);
  return {
    items: docs.map(toSignalSummary),
    page,
    limit,
    total,
    pages: Math.ceil(total / limit) || 1,
  };
};

export const createSignal = async (input) => {
  const existing = await findSignalBySlugAnyStatus(input.slug);
  if (existing) throw conflict(SIGNAL_ERRORS.SLUG_TAKEN);
  try {
    const created = await insertSignal(input);
    return toPublicSignal(created.toObject());
  } catch (err) {
    if (err?.code === MONGO_DUPLICATE_KEY) throw conflict(SIGNAL_ERRORS.SLUG_TAKEN);
    throw err;
  }
};

export const updateSignal = async (slug, patch) => {
  const updated = await patchSignalBySlug(slug, patch);
  if (!updated) throw notFound(SIGNAL_ERRORS.NOT_FOUND);
  return toPublicSignal(updated);
};

export const getRelatedForSignal = async (slug) => {
  const doc = await findSignalBySlug(slug);
  if (!doc) throw notFound(SIGNAL_ERRORS.NOT_FOUND);
  const related = await queryRelatedSignals({
    excludeSlug: slug,
    topicSlug: doc.topicSlug,
    entitySlugs: doc.entitySlugs ?? [],
    intentKeys: doc.relatedIntents ?? [],
  });
  return related.map(toSignalSummary);
};
