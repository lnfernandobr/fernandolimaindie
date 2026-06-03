import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SEED_KIND_TO_SIGNAL_KIND,
  GENERATION_ERRORS,
} from '../../constants/generation.js';
import { seedDescriptorSchema } from './generation.schema.js';
import { notFound } from '../../errors/factories.js';
import {
  countSeeds,
  bulkUpsertSeeds,
  listActiveSeeds,
  listActiveSeedsByKind,
  findSeedDocBySlug,
} from './generation.seed.repository.js';

const SEEDS_DIR_NAME = 'seeds';
const currentFileDir = path.dirname(fileURLToPath(import.meta.url));
const seedsRoot = path.resolve(currentFileDir, '..', '..', 'data', SEEDS_DIR_NAME);

const SEED_FILES = Object.freeze({
  psalm: 'psalms.json',
  prayer: 'prayers.json',
  devotional: 'devotionals.json',
  reflection: 'reflections.json',
  article: 'blog.json',
  'verse-collection': 'verse-collections.json',
});

const decorate = (seedKind, raw) =>
  seedDescriptorSchema.parse({
    seedSlug: raw.slug,
    seedKind,
    signalKind: SEED_KIND_TO_SIGNAL_KIND[seedKind],
    intent: raw.intent,
    topicSlug: raw.topicSlug,
    entitySlugs: raw.entitySlugs ?? [],
    priority: raw.priority ?? 3,
    subject: raw.subject ?? {},
  });

const loadCatalogFromFile = async (seedKind) => {
  const file = SEED_FILES[seedKind];
  const buffer = await readFile(path.join(seedsRoot, file), 'utf8');
  const list = JSON.parse(buffer);
  return list.map((raw) => decorate(seedKind, raw));
};

/** Lê todos os seeds dos arquivos JSON (fonte de import). */
export const loadSeedsFromFiles = async () => {
  const kinds = Object.keys(SEED_FILES);
  const lists = await Promise.all(kinds.map(loadCatalogFromFile));
  return lists.flat();
};

/**
 * Importa os seeds dos arquivos pro banco (upsert por slug, $setOnInsert).
 * Adiciona novos sem sobrescrever prioridade/status editados no admin.
 */
export const syncSeedsFromFiles = async () => {
  const descriptors = await loadSeedsFromFiles();
  const docs = descriptors.map((d) => ({
    slug: d.seedSlug,
    seedKind: d.seedKind,
    signalKind: d.signalKind,
    intent: d.intent,
    topicSlug: d.topicSlug,
    entitySlugs: d.entitySlugs,
    priority: d.priority,
    subject: d.subject,
    status: 'active',
  }));
  if (docs.length) await bulkUpsertSeeds(docs);
  return docs.length;
};

export { countSeeds };

const toDescriptor = (doc) => ({
  seedSlug: doc.slug,
  seedKind: doc.seedKind,
  signalKind: doc.signalKind,
  intent: doc.intent,
  topicSlug: doc.topicSlug,
  entitySlugs: doc.entitySlugs ?? [],
  priority: doc.priority ?? 3,
  subject: doc.subject ?? {},
});

/** Seeds ativos do banco (o que o cron processa). */
export const loadAllSeeds = async () => (await listActiveSeeds()).map(toDescriptor);

export const loadSeedsByKind = async (seedKind) => {
  if (!SEED_FILES[seedKind]) throw notFound(GENERATION_ERRORS.UNKNOWN_SEED_KIND);
  return (await listActiveSeedsByKind(seedKind)).map(toDescriptor);
};

export const findSeedBySlug = async (seedSlug) => {
  const doc = await findSeedDocBySlug(seedSlug);
  if (!doc) throw notFound(GENERATION_ERRORS.SEED_NOT_FOUND);
  return toDescriptor(doc);
};
