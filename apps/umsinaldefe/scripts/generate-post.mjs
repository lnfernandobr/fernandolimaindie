#!/usr/bin/env node
/**
 * scripts/generate-post.mjs
 *
 * Gerador de posts pro cron. Pega o próximo item "pending" da fila
 * (content-queue.json, ordenado por priority asc > volume desc), gera um
 * post rico via OpenAI, busca imagem no Pexels, grava em generated-posts.json
 * e marca o item como "done" na fila.
 *
 * Envs necessárias (via Docker/Doppler):
 *   OPENAI_API_KEY     — chave da OpenAI
 *   PEXELS_API_KEY     — (opcional) chave do Pexels pra imagem de capa
 *
 * Uso:
 *   node scripts/generate-post.mjs              # gera 1 post (o próximo da fila)
 *   node scripts/generate-post.mjs --count 3    # gera 3 posts de uma vez
 *   crontab: 0 6 * * * cd /app && node scripts/generate-post.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = resolve(__dirname, '../lib/content');
const QUEUE_PATH = resolve(CONTENT_DIR, 'content-queue.json');
const POSTS_PATH = resolve(CONTENT_DIR, 'generated-posts.json');

const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const PEXELS_KEY = process.env.PEXELS_API_KEY || '';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

// ── Helpers ──────────────────────────────────────────────────────────

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}
function saveJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function parseArgs() {
  const args = process.argv.slice(2);
  let count = 1;
  const idx = args.indexOf('--count');
  if (idx !== -1 && args[idx + 1]) count = Math.min(10, Math.max(1, parseInt(args[idx + 1], 10)));
  return { count };
}

// ── Pexels ───────────────────────────────────────────────────────────

async function fetchImage(keyword) {
  if (!PEXELS_KEY) return null;
  try {
    const q = encodeURIComponent(keyword.replace(/versículos?|oração|salmo/gi, '').trim() || keyword);
    const res = await fetch(`https://api.pexels.com/v1/search?query=${q}&locale=pt-BR&per_page=1&orientation=landscape`, {
      headers: { Authorization: PEXELS_KEY },
    });
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

// ── OpenAI ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Você é um redator cristão interconfessional brasileiro. Escreve em português do Brasil, caloroso, direto e sem travessão (use vírgula, ponto, dois-pontos ou parênteses). O conteúdo deve ser humanizado, sem cara de IA, com base bíblica conferida. Versículos devem ser precisos e em tradução de uso comum no Brasil.

Regras do post:
- Formato: artigo HTML (sem tag <html>/<body>, só o conteúdo do artigo).
- Comece com um parágrafo direto que responde a busca (answer-first).
- Use H2 pra cada seção (mínimo 4 seções). Conteúdo longo e rico (mínimo 800 palavras no corpo).
- Versículos dentro de <blockquote class="scripture"> com <cite> pro ref.
- Inclua pelo menos 3 versículos relevantes ao longo do texto.
- Tom: conversa de gente pra gente, sem moralismo, sem dedo na cara.
- Nunca use travessão (—). Nunca use "em suma", "portanto", "é importante ressaltar".

Responda EXCLUSIVAMENTE em JSON válido com esta estrutura:
{
  "title": "título do post (com keyword)",
  "excerpt": "1-2 frases que resolvem a busca (answer-first)",
  "readMins": <número>,
  "keyTakeaways": ["ponto 1", "ponto 2", "ponto 3", "ponto 4"],
  "bodyHtml": "<p>conteúdo HTML rico e longo...</p>",
  "faq": [
    { "question": "pergunta", "answer": "resposta" },
    { "question": "pergunta", "answer": "resposta" },
    { "question": "pergunta", "answer": "resposta" }
  ]
}`;

async function generateWithOpenAI(item) {
  if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY não configurada');

  const userPrompt = `Escreva um post completo e longo (mínimo 800 palavras no corpo) sobre: "${item.title}"

Keyword-alvo pro SEO: "${item.keyword}"
Brief: ${item.brief}
Categoria: ${item.category}
Tipo: ${item.type}

Siga as regras do sistema. Responda somente JSON.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
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

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  const { count } = parseArgs();
  const queue = loadJson(QUEUE_PATH);
  const postsFile = loadJson(POSTS_PATH);
  const posts = postsFile.posts || [];

  // Seleciona os próximos N pending, ordenados por priority asc > volume desc.
  const pending = queue.items
    .filter((i) => i.status === 'pending')
    .sort((a, b) => (a.priority - b.priority) || ((b.volume || 0) - (a.volume || 0)));

  const batch = pending.slice(0, count);
  if (batch.length === 0) {
    console.log('Fila vazia: todos os temas já foram gerados.');
    return;
  }

  console.log(`Gerando ${batch.length} post(s)...`);

  for (const item of batch) {
    console.log(`\n→ [${item.id}] ${item.keyword} (${item.slug})`);
    try {
      // 1. Gera o conteúdo via OpenAI
      const generated = await generateWithOpenAI(item);
      console.log(`  ✓ Texto gerado (${generated.readMins || '?'} min)`);

      // 2. Busca imagem no Pexels
      const image = await fetchImage(item.keyword);
      if (image) console.log(`  ✓ Imagem: ${image.credit}`);
      else console.log('  ⦿ Sem imagem (Pexels key ausente ou sem resultado)');

      // 3. Monta o post
      const now = new Date().toISOString();
      const post = {
        slug: item.slug,
        category: item.category,
        keyword: item.keyword,
        title: generated.title || item.title,
        excerpt: generated.excerpt || '',
        readMins: generated.readMins || 7,
        keyTakeaways: generated.keyTakeaways || [],
        bodyHtml: generated.bodyHtml || '',
        faq: generated.faq || [],
        image: image || null,
        relatedIntent: null,
        publishedAt: now,
        updatedAt: now,
      };

      posts.push(post);
      console.log(`  ✓ Post salvo em generated-posts.json`);

      // 4. Marca como done na fila
      const queueItem = queue.items.find((i) => i.id === item.id);
      if (queueItem) {
        queueItem.status = 'done';
        queueItem.generatedAt = now;
      }

    } catch (err) {
      console.error(`  ✗ Erro: ${err.message}`);
      // Marca como error pra não travar a fila
      const queueItem = queue.items.find((i) => i.id === item.id);
      if (queueItem) queueItem.status = 'error';
    }
  }

  // Salva tudo
  postsFile.posts = posts;
  saveJson(POSTS_PATH, postsFile);
  saveJson(QUEUE_PATH, queue);

  const remaining = queue.items.filter((i) => i.status === 'pending').length;
  console.log(`\nPronto. ${batch.length} gerado(s), ${remaining} pendente(s) na fila.`);
}

main().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
