import { conflict, notFound } from '../../errors/factories.js';
import {
  MONGO_DUPLICATE_KEY,
  TOPIC_ERRORS,
} from '../../constants/content.js';
import {
  countTopics,
  createTopic as insertTopic,
  findTopicBySlug,
  listTopics as queryListTopics,
  updateTopicBySlug as patchTopicBySlug,
} from './topics.repository.js';
import { toPublicTopic, toTopicSummary } from './topics.dto.js';

const buildFilter = ({ intent }) => {
  const filter = {};
  if (intent) filter.intent = intent;
  return filter;
};

export const getTopicBySlug = async (slug) => {
  const doc = await findTopicBySlug(slug);
  if (!doc) throw notFound(TOPIC_ERRORS.NOT_FOUND);
  return toPublicTopic(doc);
};

export const topicExists = async (slug) => Boolean(await findTopicBySlug(slug));

export const listTopics = async ({ intent, page, limit }) => {
  const filter = buildFilter({ intent });
  const skip = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    queryListTopics({ filter, skip, limit }),
    countTopics(filter),
  ]);
  return {
    items: docs.map(toTopicSummary),
    page,
    limit,
    total,
    pages: Math.ceil(total / limit) || 1,
  };
};

export const createTopic = async (input) => {
  const existing = await findTopicBySlug(input.slug);
  if (existing) throw conflict(TOPIC_ERRORS.SLUG_TAKEN);
  try {
    const created = await insertTopic(input);
    return toPublicTopic(created.toObject());
  } catch (err) {
    if (err?.code === MONGO_DUPLICATE_KEY) throw conflict(TOPIC_ERRORS.SLUG_TAKEN);
    throw err;
  }
};

export const updateTopic = async (slug, patch) => {
  const updated = await patchTopicBySlug(slug, patch);
  if (!updated) throw notFound(TOPIC_ERRORS.NOT_FOUND);
  return toPublicTopic(updated);
};
