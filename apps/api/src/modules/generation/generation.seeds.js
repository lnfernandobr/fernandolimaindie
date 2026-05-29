import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SEED_KIND_TO_SIGNAL_KIND,
  GENERATION_ERRORS,
} from '../../constants/generation.js';
import { seedDescriptorSchema } from './generation.schema.js';
import { notFound } from '../../errors/factories.js';

const SEEDS_DIR_NAME = 'seeds';

const currentFileDir = path.dirname(fileURLToPath(import.meta.url));
const seedsRoot = path.resolve(currentFileDir, '..', '..', 'data', SEEDS_DIR_NAME);

const SEED_FILES = Object.freeze({
  psalm: 'psalms.json',
  'saint-prayer': 'saints.json',
  'intent-prayer': 'intent-prayers.json',
  devotional: 'devotionals.json',
});

const decorate = (seedKind, raw) =>
  seedDescriptorSchema.parse({
    seedSlug: raw.slug,
    seedKind,
    signalKind: SEED_KIND_TO_SIGNAL_KIND[seedKind],
    intent: raw.intent,
    topicSlug: raw.topicSlug,
    entitySlugs: raw.entitySlugs ?? [],
    subject: raw.subject ?? {},
  });

const loadCatalog = async (seedKind) => {
  const file = SEED_FILES[seedKind];
  const buffer = await readFile(path.join(seedsRoot, file), 'utf8');
  const list = JSON.parse(buffer);
  return list.map((raw) => decorate(seedKind, raw));
};

export const loadAllSeeds = async () => {
  const kinds = Object.keys(SEED_FILES);
  const lists = await Promise.all(kinds.map(loadCatalog));
  return lists.flat();
};

export const loadSeedsByKind = async (seedKind) => {
  if (!SEED_FILES[seedKind]) throw notFound(GENERATION_ERRORS.UNKNOWN_SEED_KIND);
  return loadCatalog(seedKind);
};

export const findSeedBySlug = async (seedSlug) => {
  const all = await loadAllSeeds();
  const match = all.find((s) => s.seedSlug === seedSlug);
  if (!match) throw notFound(GENERATION_ERRORS.SEED_NOT_FOUND);
  return match;
};
