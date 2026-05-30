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

export const runtime = 'nodejs';
export const revalidate = 86400;

/**
 * Monta narração pra qualquer tipo de conteúdo.
 * Tenta signal (orações/salmos/devocionais), depois versículos, depois blog.
 */
function resolveNarration(slug) {
  // 1. Signal (orações, salmos, devocionais, reflexões)
  try {
    const signal = getSignal(slug);
    return { title: signal.title, text: buildNarration(signal) };
  } catch { /* não é signal */ }

  // 2. Versículos por tema (biblia)
  const topic = getVerseTopic(slug);
  if (topic) {
    const versesText = topic.verses.map((v) => `${v.text} (${v.ref})`).join('. ');
    const full = `${topic.title}. ${topic.answer}. ${versesText}`;
    return { title: topic.title, text: full };
  }

  // 3. Blog post
  const post = getPost(slug);
  if (post) {
    // Blog posts são longos, a narração foca no excerpt (resposta direta)
    const text = `${post.title}. ${post.excerpt}`;
    return { title: post.title, text };
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

  const narration = resolveNarration(slug);
  if (!narration || !narration.text) {
    return new Response('Não encontrado', { status: 404 });
  }

  // Limite de 1 minuto: se o texto é longo demais, retorna 413.
  // O front simplesmente não mostra o player (o fetch falha sem quebrar nada).
  if (!fitsAudioLimit(narration.text)) {
    const est = estimateDuration(narration.text);
    return new Response(
      `Conteúdo longo demais pra áudio (~${est}s). Limite: 60s.`,
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
