import { conflict, notFound } from '../../errors/factories.js';
import {
  MONGO_DUPLICATE_KEY,
  ENTITY_ERRORS,
} from '../../constants/soulsignal.js';
import {
  countEntities,
  createEntity as insertEntity,
  findEntityBySlug,
  listEntities as queryListEntities,
  updateEntityBySlug as patchEntityBySlug,
} from './entities.repository.js';
import { toPublicEntity, toEntitySummary } from './entities.dto.js';

const buildFilter = ({ kind }) => {
  const filter = {};
  if (kind) filter.kind = kind;
  return filter;
};

export const getEntityBySlug = async (slug) => {
  const doc = await findEntityBySlug(slug);
  if (!doc) throw notFound(ENTITY_ERRORS.NOT_FOUND);
  return toPublicEntity(doc);
};

export const entityExists = async (slug) => Boolean(await findEntityBySlug(slug));

export const listEntities = async ({ kind, page, limit }) => {
  const filter = buildFilter({ kind });
  const skip = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    queryListEntities({ filter, skip, limit }),
    countEntities(filter),
  ]);
  return {
    items: docs.map(toEntitySummary),
    page,
    limit,
    total,
    pages: Math.ceil(total / limit) || 1,
  };
};

export const createEntity = async (input) => {
  const existing = await findEntityBySlug(input.slug);
  if (existing) throw conflict(ENTITY_ERRORS.SLUG_TAKEN);
  try {
    const created = await insertEntity(input);
    return toPublicEntity(created.toObject());
  } catch (err) {
    if (err?.code === MONGO_DUPLICATE_KEY) throw conflict(ENTITY_ERRORS.SLUG_TAKEN);
    throw err;
  }
};

export const updateEntity = async (slug, patch) => {
  const updated = await patchEntityBySlug(slug, patch);
  if (!updated) throw notFound(ENTITY_ERRORS.NOT_FOUND);
  return toPublicEntity(updated);
};
