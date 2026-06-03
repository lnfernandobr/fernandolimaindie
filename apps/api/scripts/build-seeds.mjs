/**
 * Migração: content-queue.json (122 temas, com volume/prioridade) → seed files da API.
 *
 * Lê a fila do frontend e emite apps/api/src/data/seeds/*.json no formato que
 * generation.seeds.js espera: { slug, intent, topicSlug, priority, subject }.
 * Preserva os slugs (URLs) e a prioridade por tráfego. One-shot, reexecutável.
 *
 *   node apps/api/scripts/build-seeds.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// Catálogo de migração (cópia de record da antiga content-queue.json do frontend).
const QUEUE = path.resolve(here, '..', 'src', 'data', 'content-queue.source.json');
const OUT_DIR = path.resolve(here, '..', 'src', 'data', 'seeds');

const TYPE_TO_SEEDKIND = {
  salmo: 'psalm',
  oracao: 'prayer',
  devocional: 'devotional',
  reflexao: 'reflection',
  biblia: 'verse-collection',
  blog: 'article',
};

const SEEDKIND_TO_FILE = {
  psalm: 'psalms.json',
  prayer: 'prayers.json',
  devotional: 'devotionals.json',
  reflection: 'reflections.json',
  'verse-collection': 'verse-collections.json',
  article: 'blog.json',
};

const VALID_INTENTS = new Set([
  'anxiety', 'sleep', 'fear', 'gratitude', 'protection', 'faith', 'hope',
  'family', 'finances', 'grief', 'morning', 'night', 'healing', 'forgiveness',
]);

// Heurística de intent pra itens (blog) sem intent. Ordem importa.
const INTENT_RULES = [
  [/perdoar|perd[aã]o/, 'forgiveness'],
  [/\b(perda|luto|solid[aã]o|morte|saudade)\b/, 'grief'],
  [/medo|coragem/, 'fear'],
  [/ansiedade|ansios/, 'anxiety'],
  [/d[ií]vida|dinheiro|financ|trabalho|emprego/, 'finances'],
  [/casamento|fam[ií]lia|filhos|esposa|marido|c[oô]njuge/, 'family'],
  [/gratid[aã]o|agradec/, 'gratitude'],
  [/dormir|sono|noite/, 'sleep'],
  [/manh[aã]|bom dia/, 'morning'],
  [/cura|sa[uú]de|doen|enfermidade/, 'healing'],
  [/esperan[çc]a/, 'hope'],
  [/prote[çc][aã]o|guarda|mal\b/, 'protection'],
];

const inferIntent = (item) => {
  if (item.intent && VALID_INTENTS.has(item.intent)) return item.intent;
  const hay = `${item.slug} ${item.keyword ?? ''} ${item.title ?? ''} ${item.brief ?? ''}`.toLowerCase();
  for (const [re, intent] of INTENT_RULES) if (re.test(hay)) return intent;
  return 'faith';
};

// Extrai refs bíblicas do brief como dica (ex.: "Provérbios 17:17, 18:24").
const BOOK = '(?:[1-3]\\s?)?[A-ZÁÂÃÉÊÍÓÔÕÚ][a-zâêçãõáéíóúà]+(?:\\s[A-Za-zâêçãõáéíóúà]+)?';
const REF_RE = new RegExp(`${BOOK}\\s\\d{1,3}[:,]\\s?\\d{1,3}(?:-\\d{1,3})?`, 'g');
const extractRefs = (brief = '') => {
  const found = brief.match(REF_RE) ?? [];
  return [...new Set(found.map((s) => s.trim()))].slice(0, 12);
};

const psalmNumber = (slug) => {
  const m = slug.match(/^salmo-(\d{1,3})$/);
  return m ? Number(m[1]) : null;
};

const main = async () => {
  const queue = JSON.parse(await readFile(QUEUE, 'utf8'));
  const buckets = Object.fromEntries(Object.keys(SEEDKIND_TO_FILE).map((k) => [k, []]));
  const skipped = [];
  const seenSlugs = new Set();

  for (const item of queue.items) {
    const seedKind = TYPE_TO_SEEDKIND[item.type];
    if (!seedKind) { skipped.push([item.slug, `tipo desconhecido: ${item.type}`]); continue; }

    // Salmo precisa de número; descarta entradas temáticas malformadas (ex.: salmo-salmo-da-noite).
    let pNum = null;
    if (seedKind === 'psalm') {
      pNum = psalmNumber(item.slug);
      if (!pNum) { skipped.push([item.slug, 'salmo sem número']); continue; }
    }

    const slug = seedKind === 'verse-collection' ? `biblia-${item.slug}` : item.slug;
    if (seenSlugs.has(slug)) { skipped.push([slug, 'slug duplicado']); continue; }
    seenSlugs.add(slug);

    const intent = inferIntent(item);
    const topicSlug =
      item.topicSlug ||
      (seedKind === 'verse-collection' ? 'versiculos-da-biblia' : item.category) ||
      'geral';

    const subject = { title: item.title, keyword: item.keyword, brief: item.brief };
    if (seedKind === 'psalm') subject.psalmNumber = pNum;
    if (seedKind === 'article') subject.category = item.category ?? 'vida-crista';
    if (seedKind === 'verse-collection') {
      subject.tag = item.tag ?? item.title;
      subject.category = item.category ?? 'biblia-explicada';
      const refs = extractRefs(item.brief);
      if (refs.length) subject.verseRefs = refs;
    }

    buckets[seedKind].push({
      slug,
      intent,
      topicSlug,
      priority: item.priority ?? 3,
      subject,
    });
  }

  for (const [seedKind, list] of Object.entries(buckets)) {
    list.sort((a, b) => a.priority - b.priority);
    const file = path.join(OUT_DIR, SEEDKIND_TO_FILE[seedKind]);
    await writeFile(file, `${JSON.stringify(list, null, 2)}\n`, 'utf8');
    console.log(`${SEEDKIND_TO_FILE[seedKind]}: ${list.length} seeds`);
  }

  const total = Object.values(buckets).reduce((n, l) => n + l.length, 0);
  console.log(`\nTotal: ${total} seeds de ${queue.items.length} itens da fila.`);
  if (skipped.length) {
    console.log(`Pulados (${skipped.length}):`);
    for (const [slug, why] of skipped) console.log(`  - ${slug}: ${why}`);
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
