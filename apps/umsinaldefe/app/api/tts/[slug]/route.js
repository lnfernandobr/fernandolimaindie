import { getSignal } from '@/lib/content/api.js';
import { getVerseTopic } from '@/lib/content/biblia.js';
import { getPost } from '@/lib/content/blog.js';
import {
  buildNarration,
  synthesizeSpeech,
  isTtsConfigured,
  fitsAudioLimit,
  estimateDuration,
} from '@/lib/media/elevenlabs.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const runtime = 'nodejs';

function loadAudioCfg() {
  try {
    const cfg = JSON.parse(readFileSync(resolve(process.cwd(), 'lib/content/cron-config.json'), 'utf-8'));
    const a = cfg.audio || {};
    return { enabled: a.enabled !== false, maxMinutes: Math.min(10, Math.max(1, a.maxMinutes || 2)) };
  } catch {
    return { enabled: true, maxMinutes: 2 };
  }
}
export const revalidate = 86400;

/**
 * Monta narração pra qualquer tipo de conteúdo.
 * Tenta signal (orações/salmos/devocionais), depois versículos, depois blog.
 */
function resolveNarration(slug, maxWords) {
  // 1. Signal (orações, salmos, devocionais, reflexões)
  try {
    const signal = getSignal(slug);
    return { title: signal.title, text: buildNarration(signal, maxWords), audioEnabled: signal.audioEnabled };
  } catch { /* não é signal */ }

  // 2. Versículos por tema (biblia)
  const topic = getVerseTopic(slug);
  if (topic) {
    const full = [topic.title, topic.answer, topic.summary].filter(Boolean).join('. ');
    return { title: topic.title, text: full, audioEnabled: topic.audioEnabled };
  }

  // 3. Blog post
  const post = getPost(slug);
  if (post) {
    // Blog posts são longos, a narração foca no excerpt (resposta direta)
    const text = `${post.title}. ${post.excerpt}`;
    return { title: post.title, text, audioEnabled: post.audioEnabled };
  }

  return null;
}

export async function GET(_request, { params }) {
  const { slug } = await params;

  if (!isTtsConfigured()) {
    return new Response('TTS indisponível', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  const audioCfg = loadAudioCfg();
  if (!audioCfg.enabled) {
    return new Response('Áudio desativado', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  const maxWords = Math.round(audioCfg.maxMinutes * 150); // ~150 palavras por minuto

  const narration = resolveNarration(slug, maxWords);
  if (!narration || !narration.text) {
    return new Response('Não encontrado', { status: 404 });
  }
  if (narration.audioEnabled === false) {
    return new Response('Áudio desativado para este item', {
      status: 404,
      headers: { 'Cache-Control': 'public, max-age=3600' },
    });
  }

  // Limite configurável (maxMinutes): se o texto é longo demais, retorna 413.
  if (!fitsAudioLimit(narration.text, maxWords)) {
    const est = estimateDuration(narration.text);
    return new Response(
      `Conteúdo longo demais pra áudio (~${est}s). Limite: ${audioCfg.maxMinutes}min.`,
      { status: 413, headers: { 'Cache-Control': 'public, max-age=86400' } },
    );
  }

  try {
    const audio = await synthesizeSpeech(narration.text);
    return new Response(audio, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audio.byteLength),
        'Cache-Control': 'public, max-age=86400, s-maxage=2592000, immutable',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (err) {
    return new Response(`Falha ao gerar áudio: ${err.message}`, {
      status: 502,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
