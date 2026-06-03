import { getSignal } from '@/lib/content/api.js';
import {
  buildNarration,
  synthesizeSpeech,
  isTtsConfigured,
  fitsAudioLimit,
  estimateDuration,
} from '@/lib/media/elevenlabs.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Limite de áudio (minutos). ~150 palavras por minuto.
const AUDIO_MAX_MINUTES = 2;

export async function GET(_request, { params }) {
  const { slug } = await params;

  if (!isTtsConfigured()) {
    return new Response('TTS indisponível', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  const maxWords = Math.round(AUDIO_MAX_MINUTES * 150);

  // Todo conteúdo é um signal (orações, salmos, devocionais, reflexões, blog, bíblia).
  let signal;
  try {
    signal = await getSignal(slug);
  } catch {
    return new Response('Não encontrado', { status: 404 });
  }

  if (signal.audioEnabled === false) {
    return new Response('Áudio desativado para este item', {
      status: 404,
      headers: { 'Cache-Control': 'public, max-age=3600' },
    });
  }

  const text = buildNarration(signal, maxWords);
  if (!text) {
    return new Response('Não encontrado', { status: 404 });
  }

  // Limite configurável: se o texto é longo demais, retorna 413.
  if (!fitsAudioLimit(text, maxWords)) {
    const est = estimateDuration(text);
    return new Response(
      `Conteúdo longo demais pra áudio (~${est}s). Limite: ${AUDIO_MAX_MINUTES}min.`,
      { status: 413, headers: { 'Cache-Control': 'public, max-age=86400' } },
    );
  }

  try {
    const audio = await synthesizeSpeech(text);
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
