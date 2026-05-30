import { getSignal } from '@/lib/content/api.js';
import {
  buildNarration,
  synthesizeSpeech,
  isTtsConfigured,
} from '@/lib/media/elevenlabs.js';

// Roda no Node (precisa de fetch server-side com a chave secreta).
export const runtime = 'nodejs';
// Cacheia por um dia; ElevenLabs é caro e o texto não muda.
export const revalidate = 86400;

export async function GET(_request, { params }) {
  const { slug } = await params;

  // Sem chave (ex.: dev local antes do Docker): devolve 503 e o player
  // do cliente cai no modo simulado, sem tela quebrada.
  if (!isTtsConfigured()) {
    return new Response('TTS indisponível', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  let signal;
  try {
    signal = await getSignal(slug);
  } catch {
    return new Response('Não encontrado', { status: 404 });
  }

  const text = buildNarration(signal);
  if (!text) {
    return new Response('Sem texto pra narrar', { status: 422 });
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
