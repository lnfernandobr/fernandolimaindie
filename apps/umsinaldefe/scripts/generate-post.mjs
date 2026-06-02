#!/usr/bin/env node
/**
 * scripts/generate-post.mjs
 *
 * Gerador de conteúdo pro cron. Pega o próximo item "pending" da fila
 * (content-queue.json, ordenado por priority asc > volume desc) e, conforme
 * o `type` do item, gera e salva no arquivo certo, que os módulos
 * lib/content/* mesclam ao conteúdo curado:
 *   - salmo | oracao | devocional | reflexao → "signal"     → generated-signals.json
 *   - biblia                                 → "verse topic" → generated-verse-topics.json
 *   - blog                                   → "post"        → generated-posts.json
 * Marca o item como "done" (ou "error") na fila.
 *
 * Envs (via Docker/Doppler):
 *   OPENAI_API_KEY   chave da OpenAI
 *   PEXELS_API_KEY   (opcional) imagem de capa
 *   OPENAI_MODEL     (opcional) default gpt-4o
 *
 * Uso:
 *   node scripts/generate-post.mjs            # 1 item
 *   node scripts/generate-post.mjs --count 5  # 5 itens
 *   crontab: 0 6 * * * cd /app && node scripts/generate-post.mjs && pnpm build
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SYSTEM_PROMPTS, buildUserPrompt, buildImagePrompt } from '../lib/content/prompts.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = resolve(__dirname, '../lib/content');
const QUEUE_PATH = resolve(CONTENT_DIR, 'content-queue.json');
const POSTS_PATH = resolve(CONTENT_DIR, 'generated-posts.json');
const SIGNALS_PATH = resolve(CONTENT_DIR, 'generated-signals.json');
const TOPICS_PATH = resolve(CONTENT_DIR, 'generated-verse-topics.json');
const CRON_CONFIG_PATH = resolve(CONTENT_DIR, 'cron-config.json');

const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const PEXELS_KEY = process.env.PEXELS_API_KEY || '';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o';
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const PUBLIC_IMG_DIR = resolve(__dirname, '../public/img/gen');

// ── Helpers ──────────────────────────────────────────────────────────

function loadJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return fallback;
  }
}
function saveJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}
function parseArgs() {
  const args = process.argv.slice(2);
  let count = null;
  let type = null;
  const ci = args.indexOf('--count');
  if (ci !== -1 && args[ci + 1]) count = Math.min(20, Math.max(1, parseInt(args[ci + 1], 10)));
  const ti = args.indexOf('--type');
  if (ti !== -1 && args[ti + 1]) type = args[ti + 1];
  const cron = args.includes('--cron');
  return { count, type, cron };
}

const DEFAULT_CRON_CONFIG = {
  enabled: true,
  imageProvider: 'openai', // 'openai' | 'pexels' | 'none'
  scheduleHourUtc: 6,
  audio: { enabled: true, maxMinutes: 2 },
  perSection: { salmo: 2, oracao: 2, biblia: 2, blog: 2, devocional: 2, reflexao: 2 },
};
function loadCronConfig() {
  const cfg = loadJson(CRON_CONFIG_PATH, DEFAULT_CRON_CONFIG);
  return {
    ...DEFAULT_CRON_CONFIG,
    ...cfg,
    audio: { ...DEFAULT_CRON_CONFIG.audio, ...(cfg.audio || {}) },
    perSection: { ...DEFAULT_CRON_CONFIG.perSection, ...(cfg.perSection || {}) },
  };
}
const firstNumber = (s) => (String(s || '').match(/\d+/) || [])[0] || null;
const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// ── Pexels ───────────────────────────────────────────────────────────

async function fetchImage(keyword) {
  if (!PEXELS_KEY) return null;
  try {
    const q = encodeURIComponent(keyword.replace(/versículos?|oração|salmo/gi, '').trim() || keyword);
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${q}&locale=pt-BR&per_page=1&orientation=landscape`,
      { headers: { Authorization: PEXELS_KEY } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const photo = data?.photos?.[0];
    if (!photo) return null;
    return {
      src: photo.src.large2x || photo.src.large,
      alt: photo.alt || keyword,
      credit: `Foto: ${photo.photographer} / Pexels`,
      creditUrl: photo.photographer_url,
    };
  } catch {
    return null;
  }
}

// ── Imagem (OpenAI gpt-image, com fallback Pexels) ───────────────────

async function generateOpenAIImage(item) {
  if (!OPENAI_KEY) return null;
  const subject = String(item.keyword || item.title || '').replace(/["\n]/g, ' ').trim();
  const prompt = buildImagePrompt(item);
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: IMAGE_MODEL, prompt, size: '1536x1024', quality: 'high', n: 1 }),
    });
    if (!res.ok) {
      console.error(`  ⦿ Imagem OpenAI falhou: ${res.status}`);
      return null;
    }
    const data = await res.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) return null;
    mkdirSync(PUBLIC_IMG_DIR, { recursive: true });
    const file = `${item.slug}.png`;
    writeFileSync(resolve(PUBLIC_IMG_DIR, file), Buffer.from(b64, 'base64'));
    return { src: `/img/gen/${file}`, alt: subject, credit: 'Imagem gerada por IA', creditUrl: null };
  } catch (e) {
    console.error(`  ⦿ Imagem OpenAI erro: ${e.message}`);
    return null;
  }
}

async function pickImage(item, provider) {
  if (provider === 'none') return null;
  if (provider === 'openai') return (await generateOpenAIImage(item)) || (await fetchImage(item.keyword));
  return await fetchImage(item.keyword);
}

// ── OpenAI ───────────────────────────────────────────────────────────

// Prompts, voz da marca e regras de SEO ficam em lib/content/prompts.mjs (fonte única).

function promptKeyForType(type) {
  if (type === 'biblia') return 'biblia';
  if (type === 'blog') return 'blog';
  return 'signal'; // salmo, oracao, devocional, reflexao
}

async function callOpenAI(systemPrompt, item) {
  if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY não configurada');
  const userPrompt = buildUserPrompt(item);

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.7,
      max_tokens: 6000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`OpenAI falhou: ${res.status} ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error('OpenAI retornou vazio');
  return JSON.parse(raw);
}

// ── Builders por tipo ────────────────────────────────────────────────

function buildBlogPost(item, gen, image, now) {
  return {
    slug: item.slug,
    category: item.category || 'vida-crista',
    keyword: item.keyword,
    title: gen.title || item.title,
    excerpt: gen.excerpt || '',
    readMins: gen.readMins || 7,
    keyTakeaways: gen.keyTakeaways || [],
    bodyHtml: gen.bodyHtml || '',
    faq: gen.faq || [],
    image: image || null,
    relatedIntent: item.intent || null,
    publishedAt: now,
    updatedAt: now,
  };
}

function signalKind(item) {
  if (item.kind) return item.kind;
  if (item.type === 'salmo') return 'psalm';
  if (item.type === 'devocional') return 'devotional';
  if (item.type === 'reflexao') return 'reflection';
  return 'prayer';
}

function signalSlug(item, kind) {
  if (item.slug) return item.slug;
  if (kind === 'psalm') {
    const n = firstNumber(item.keyword) || firstNumber(item.title);
    return n ? `salmo-${n}` : `salmo-${slugify(item.keyword)}`;
  }
  const prefix = kind === 'devotional' ? 'devocional' : 'oracao';
  return `${prefix}-${slugify(item.keyword)}`;
}

function buildSignal(item, gen, image, now) {
  const kind = signalKind(item);
  const chunks = Array.isArray(gen.sections)
    ? gen.sections.map((s, i) => ({ id: s.id || `sec-${i + 1}`, html: `<h2>${s.heading}</h2>\n${s.html}` }))
    : [];
  return {
    slug: signalSlug(item, kind),
    kind,
    intent: item.intent || 'faith',
    topicSlug: item.topicSlug || 'oracoes-essenciais',
    title: gen.title || item.title,
    answer: gen.answer || '',
    summary: gen.summary || '',
    bodyHtml: gen.bodyHtml || '',
    chunks,
    faq: gen.faq || [],
    relatedIntents: Array.isArray(gen.relatedIntents) ? gen.relatedIntents : [],
    imageUrl: image?.src || null,
    publishedAt: now,
    updatedAt: now,
  };
}

function buildTopic(item, gen) {
  const tag =
    item.tag ||
    (item.title || item.slug)
      .split(':')[0]
      .replace(/^Vers[ií]culos sobre (o |a |os |as )?/i, '')
      .trim() ||
    item.slug;
  return {
    slug: item.slug,
    intent: item.intent || 'faith',
    tag,
    title: gen.title || item.title,
    answer: gen.answer || '',
    summary: gen.summary || '',
    verses: Array.isArray(gen.verses) ? gen.verses.map((x) => ({ ref: x.ref, text: x.text })) : [],
    reflectionHtml: gen.reflectionHtml || '',
    faq: gen.faq || [],
  };
}

function upsertBySlug(list, obj) {
  const i = list.findIndex((x) => x.slug === obj.slug);
  if (i >= 0) list[i] = obj;
  else list.push(obj);
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  const { count, type, cron } = parseArgs();
  const cfg = loadCronConfig();
  const imageProvider = cfg.imageProvider || 'openai';
  const audioOn = (item) => {
    if (item.audio === 'off') return false;
    if (item.audio === 'on') return true;
    return cfg.audio?.enabled !== false;
  };

  // Quando chamado pelo cron horario (--cron), só roda na hora agendada.
  if (cron) {
    const nowH = new Date().getUTCHours();
    const target = Number.isFinite(cfg.scheduleHourUtc) ? cfg.scheduleHourUtc : 6;
    if (nowH !== target) {
      console.log(`Fora do horario do cron (agora ${nowH}h UTC, agendado ${target}h). Saindo.`);
      process.exit(3);
    }
  }
  const queue = loadJson(QUEUE_PATH, { items: [] });
  const postsFile = loadJson(POSTS_PATH, { posts: [] });
  const signalsFile = loadJson(SIGNALS_PATH, { signals: [] });
  const topicsFile = loadJson(TOPICS_PATH, { topics: [] });
  postsFile.posts = postsFile.posts || [];
  signalsFile.signals = signalsFile.signals || [];
  topicsFile.topics = topicsFile.topics || [];

  const sortFn = (a, b) => a.priority - b.priority || (b.volume || 0) - (a.volume || 0);
  const dueNow = (i) => !i.scheduledFor || new Date(i.scheduledFor) <= new Date();
  const pendingOf = (t) =>
    queue.items
      .filter((i) => i.status === 'pending' && (!t || i.type === t) && dueNow(i))
      .sort(sortFn);

  let batch = [];
  let mode = '';
  if (count != null || type) {
    // Modo manual: --count N [--type tipo]
    batch = pendingOf(type).slice(0, count || 1);
    mode = `manual (tipo=${type || 'todos'}, count=${count || 1})`;
  } else {
    // Modo do cron: N itens por seção, configurável via cron-config.json / admin.
    if (cfg.enabled === false) {
      console.log('Geração desativada na config (cron-config.json).');
      process.exit(3);
    }
    const parts = [];
    for (const [t, n] of Object.entries(cfg.perSection || {})) {
      const picked = pendingOf(t).slice(0, Number(n) || 0);
      batch.push(...picked);
      parts.push(`${t}:${picked.length}`);
    }
    mode = `por seção (${parts.join(', ')})`;
  }

  if (batch.length === 0) {
    console.log('Nada pendente pra gerar.');
    process.exit(3);
  }
  console.log(`Modo: ${mode}. Gerando ${batch.length} item(ns)...`);

  let touchedPosts = false;
  let touchedSignals = false;
  let touchedTopics = false;

  for (const item of batch) {
    const promptKey = promptKeyForType(item.type);
    console.log(`\n→ [${item.id}] (${item.type}) ${item.keyword}`);
    try {
      const gen = await callOpenAI(SYSTEM_PROMPTS[promptKey], item);
      const now = new Date().toISOString();
      const image = promptKey === 'biblia' ? null : await pickImage(item, imageProvider);

      if (promptKey === 'blog') {
        const obj = buildBlogPost(item, gen, image, now);
        obj.audioEnabled = audioOn(item);
        upsertBySlug(postsFile.posts, obj);
        touchedPosts = true;
      } else if (promptKey === 'biblia') {
        const obj = buildTopic(item, gen);
        obj.audioEnabled = audioOn(item);
        upsertBySlug(topicsFile.topics, obj);
        touchedTopics = true;
      } else {
        const obj = buildSignal(item, gen, image, now);
        obj.audioEnabled = audioOn(item);
        upsertBySlug(signalsFile.signals, obj);
        touchedSignals = true;
      }
      console.log(`  ✓ gerado (${promptKey})`);

      const qi = queue.items.find((q) => q.id === item.id);
      if (qi) {
        qi.status = 'done';
        qi.generatedAt = now;
      }
    } catch (err) {
      console.error(`  ✗ Erro: ${err.message}`);
      const qi = queue.items.find((q) => q.id === item.id);
      if (qi) qi.status = 'error';
    }
  }

  if (touchedPosts) saveJson(POSTS_PATH, postsFile);
  if (touchedSignals) saveJson(SIGNALS_PATH, signalsFile);
  if (touchedTopics) saveJson(TOPICS_PATH, topicsFile);
  saveJson(QUEUE_PATH, queue);

  const remaining = queue.items.filter((i) => i.status === 'pending').length;
  console.log(`\nPronto. ${batch.length} processado(s), ${remaining} pendente(s) na fila.`);
}

main().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
