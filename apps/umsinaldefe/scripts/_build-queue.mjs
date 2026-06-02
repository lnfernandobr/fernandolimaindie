/**
 * scripts/_build-queue.mjs  (one-shot)
 *
 * Reconstrói content-queue.json unificando:
 *   1) conteúdo curado do dataset.js (salmos/orações/devocionais/reflexões)
 *   2) temas curados do biblia.js
 *   3) a fila antiga (content-queue.json)
 *   4) a collection nova validada no Ubersuggest (/mnt/c/Users/lnfer/umsinaldefe-content-collection.json)
 * Dedup por type:slug (slug normalizado pra bater com as rotas). Prioriza por volume.
 *
 * Importa dataset.js/biblia.js via cópias temporárias sem o import de JSON
 * (Node puro exige `with { type: json }`, que o bundler do Next dispensa).
 */
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT = resolve(__dirname, '../lib/content');
const QUEUE_PATH = resolve(CONTENT, 'content-queue.json');
const COLLECTION_PATH = '/mnt/c/Users/lnfer/umsinaldefe-content-collection.json';

const slugify = (s) =>
  String(s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const firstNumber = (s) => (String(s || '').match(/\d+/) || [])[0] || null;

const KIND_BY_TYPE = { salmo: 'psalm', oracao: 'prayer', devocional: 'devotional', reflexao: 'reflection' };
const TYPE_BY_KIND = { psalm: 'salmo', prayer: 'oracao', devotional: 'devocional', reflection: 'reflexao' };
const CATEGORY_BY_TYPE = { salmo: 'salmos', oracao: 'oracoes', devocional: 'devocionais', reflexao: 'oracoes', biblia: 'biblia-explicada', blog: 'vida-crista' };
const SECTION_TO_TYPE = { salmo: 'salmo', oracao: 'oracao', 'biblia-tema': 'biblia', blog: 'blog' };

function normSlug(type, rawSlug, keyword, title) {
  if (type === 'salmo') {
    const n = firstNumber(keyword) || firstNumber(rawSlug) || firstNumber(title);
    return n ? `salmo-${n}` : `salmo-${slugify(keyword || rawSlug)}`;
  }
  if (type === 'oracao' || type === 'reflexao') {
    return String(rawSlug || '').startsWith('oracao-') ? rawSlug : `oracao-${slugify(rawSlug || keyword)}`;
  }
  if (type === 'devocional') {
    return String(rawSlug || '').startsWith('devocional-') ? rawSlug : `devocional-${slugify(rawSlug || keyword)}`;
  }
  if (type === 'biblia') {
    return slugify(String(rawSlug || '').replace(/^versiculos?-(sobre|de)-/, '') || keyword);
  }
  return slugify(rawSlug || keyword);
}

function defaultTopic(type, intent) {
  if (type === 'salmo') return intent === 'protection' ? 'salmos-de-protecao' : 'salmos-de-confianca';
  if (type === 'devocional') return 'esperanca';
  return 'oracoes-essenciais';
}

// ---- importa curado via cópias temporárias sem o import de JSON ----
function makeTmp(src, tmp, repls) {
  let t = readFileSync(resolve(CONTENT, src), 'utf-8');
  for (const [re, val] of repls) t = t.replace(re, val);
  writeFileSync(resolve(CONTENT, tmp), t, 'utf-8');
}
makeTmp('dataset.js', '_tmp_dataset.mjs', [[/import generatedSignalsFile.*\r?\n/, ''], [/generatedSignalsFile\?\.signals/g, 'null']]);
makeTmp('biblia.js', '_tmp_biblia.mjs', [[/import generatedTopicsFile.*\r?\n/, ''], [/generatedTopicsFile\?\.topics/g, 'null']]);

const ds = await import('../lib/content/_tmp_dataset.mjs');
const bb = await import('../lib/content/_tmp_biblia.mjs');
rmSync(resolve(CONTENT, '_tmp_dataset.mjs'));
rmSync(resolve(CONTENT, '_tmp_biblia.mjs'));

// ---- mapa dedup ----
const map = new Map();
function add(it) {
  const slug = normSlug(it.type, it.slug, it.keyword, it.title);
  const key = `${it.type}:${slug}`;
  const cur = map.get(key);
  const next = { ...it, slug };
  if (!cur) { map.set(key, next); return; }
  map.set(key, {
    ...cur,
    intent: cur.intent || next.intent,
    topicSlug: cur.topicSlug || next.topicSlug,
    tag: cur.tag || next.tag,
    brief: cur.brief || next.brief,
    volume: cur.volume ?? next.volume,
    sd: cur.sd ?? next.sd,
  });
}

// 1) signals curados
for (const s of ds.SIGNALS) {
  const type = TYPE_BY_KIND[s.kind] || 'oracao';
  add({
    type, kind: s.kind, intent: s.intent, topicSlug: s.topicSlug, slug: s.slug,
    keyword: (s.title || '').split(':')[0].trim() || s.slug,
    title: s.title, brief: (s.answer || '').slice(0, 240),
    category: CATEGORY_BY_TYPE[type], volume: null, sd: null, source: 'curated',
  });
}
// 2) temas curados da bíblia
for (const t of bb.listVerseTopics()) {
  add({
    type: 'biblia', intent: t.intent, tag: t.tag, slug: t.slug,
    keyword: `versículos sobre ${String(t.tag || t.slug).toLowerCase()}`,
    title: t.title, brief: (t.answer || '').slice(0, 240),
    category: 'biblia-explicada', volume: null, sd: null, source: 'curated',
  });
}
// 3) fila antiga
const oldQ = JSON.parse(readFileSync(QUEUE_PATH, 'utf-8'));
for (const it of oldQ.items) {
  add({
    type: it.type, kind: KIND_BY_TYPE[it.type], intent: it.intent, topicSlug: it.topicSlug, tag: it.tag,
    slug: it.slug, keyword: it.keyword, title: it.title, brief: it.brief,
    category: it.category || CATEGORY_BY_TYPE[it.type],
    volume: it.volume ?? null, sd: it.sd ?? null, source: 'queue-v1',
  });
}
// 4) collection nova
if (existsSync(COLLECTION_PATH)) {
  const coll = JSON.parse(readFileSync(COLLECTION_PATH, 'utf-8'));
  for (const it of coll.items) {
    const type = SECTION_TO_TYPE[it.section] || 'blog';
    const rawSlug = String(it.suggestedUrl || '').split('/').pop();
    add({
      type, kind: KIND_BY_TYPE[type],
      slug: type === 'salmo' ? `salmo-${firstNumber(it.targetKeyword) || rawSlug}` : rawSlug,
      keyword: it.targetKeyword, title: it.suggestedTitle,
      brief: `${it.topic}. Foco no termo "${it.targetKeyword}".`,
      tag: type === 'biblia' ? String(it.topic || '').replace(/^Vers[ií]culos sobre (o |a |os |as )?/i, '') : undefined,
      category: CATEGORY_BY_TYPE[type], volume: it.volume ?? null, sd: it.kd ?? null, source: 'collection-v2',
    });
  }
}

// ---- finaliza ----
const items = [...map.values()].sort((a, b) => (b.volume || 0) - (a.volume || 0));
const queue = {
  _comment: `Fila unica do cron (gerada por scripts/_build-queue.mjs em ${new Date().toISOString().slice(0, 10)}). type define o gerador: salmo/oracao/devocional/reflexao=signal, biblia=verse-topic, blog=post. status: pending|done|error.`,
  items: items.map((it, i) => {
    const isSignal = ['salmo', 'oracao', 'devocional', 'reflexao'].includes(it.type);
    return {
      id: i + 1,
      type: it.type,
      ...(isSignal ? { kind: it.kind || KIND_BY_TYPE[it.type], intent: it.intent || 'faith', topicSlug: it.topicSlug || defaultTopic(it.type, it.intent) } : {}),
      ...(it.type === 'biblia' ? { intent: it.intent || 'faith', tag: it.tag || it.title } : {}),
      category: it.category || CATEGORY_BY_TYPE[it.type],
      slug: it.slug,
      keyword: it.keyword,
      volume: it.volume ?? null,
      sd: it.sd ?? null,
      priority: it.volume ? (it.volume >= 100000 ? 1 : it.volume >= 10000 ? 2 : 3) : 3,
      title: it.title,
      brief: it.brief || '',
      status: 'pending',
      source: it.source,
    };
  }),
};
writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n', 'utf-8');

const byType = {};
for (const it of queue.items) byType[it.type] = (byType[it.type] || 0) + 1;
console.log('Total itens na fila:', queue.items.length);
console.log('Por tipo:', JSON.stringify(byType));
console.log('Top 8 por volume:');
for (const it of queue.items.slice(0, 8)) console.log(`  [${it.type}] ${it.slug}  vol=${it.volume}  kd=${it.sd}`);
