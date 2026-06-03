import { conflict, notFound } from '../../errors/factories.js';
import { SEED_KIND_TO_SIGNAL_KIND, GENERATION_ERRORS } from '../../constants/generation.js';
import { findSignalsBySlugs } from '../signals/signals.repository.js';
import {
  listAllSeeds,
  findSeedDocBySlug,
  createSeedDoc,
  updateSeedBySlug,
  deleteSeedBySlug,
} from './generation.seed.repository.js';

const slugify = (s) =>
  (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);

const DEFAULT_TOPIC = { 'verse-collection': 'versiculos-da-biblia', article: 'vida-crista' };

/** Lista todos os seeds (inclui pausados) + flag de já publicado. Pra fila do admin. */
export const listSeedsForAdmin = async () => {
  const seeds = await listAllSeeds();
  const published = await findSignalsBySlugs(seeds.map((s) => s.slug));
  const publishedSet = new Set(published.map((p) => p.slug));
  return {
    total: seeds.length,
    items: seeds.map((s) => ({
      slug: s.slug,
      seedKind: s.seedKind,
      signalKind: s.signalKind,
      intent: s.intent,
      topicSlug: s.topicSlug,
      priority: s.priority,
      status: s.status,
      published: publishedSet.has(s.slug),
      title: s.subject?.title ?? s.slug,
      keyword: s.subject?.keyword ?? '',
    })),
  };
};

export const createSeed = async (input) => {
  const { seedKind, intent, keyword, title, brief, topicSlug, priority } = input;
  const signalKind = SEED_KIND_TO_SIGNAL_KIND[seedKind];
  if (!signalKind) throw notFound(GENERATION_ERRORS.UNKNOWN_SEED_KIND);

  let slug = slugify(title || keyword);
  if (!slug) throw conflict('Slug vazio: informe título ou keyword.');
  if (seedKind === 'verse-collection' && !slug.startsWith('biblia-')) slug = `biblia-${slug}`;

  if (await findSeedDocBySlug(slug)) throw conflict('Já existe uma seed com esse slug.');

  const doc = await createSeedDoc({
    slug,
    seedKind,
    signalKind,
    intent,
    topicSlug: topicSlug || DEFAULT_TOPIC[seedKind] || 'geral',
    entitySlugs: [],
    priority: priority ?? 3,
    status: 'active',
    subject: { title: title || keyword, keyword: keyword || title, brief: brief || '' },
  });
  return { slug: doc.slug };
};

export const updateSeed = async (slug, patch) => {
  const updated = await updateSeedBySlug(slug, patch);
  if (!updated) throw notFound(GENERATION_ERRORS.SEED_NOT_FOUND);
  return { slug: updated.slug, priority: updated.priority, status: updated.status };
};

export const deleteSeed = async (slug) => {
  const deleted = await deleteSeedBySlug(slug);
  if (!deleted) throw notFound(GENERATION_ERRORS.SEED_NOT_FOUND);
  return { slug, deleted: true };
};
