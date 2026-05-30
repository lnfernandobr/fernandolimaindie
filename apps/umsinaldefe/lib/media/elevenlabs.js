// Server-only: importado apenas pelo route handler de TTS (roda no servidor).
// A chave da ElevenLabs nunca chega ao cliente.
import { env } from '@/lib/env.js';

const ELEVENLABS_TTS_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// Limite defensivo de caracteres por narração. ElevenLabs cobra por caractere,
// e leituras devocionais não precisam ser longas.
const MAX_NARRATION_CHARS = 2800;

const VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.15,
  use_speaker_boost: true,
};

const ENTITIES = {
  '&ldquo;': '“',
  '&rdquo;': '”',
  '&lsquo;': '‘',
  '&rsquo;': '’',
  '&aacute;': 'á',
  '&eacute;': 'é',
  '&iacute;': 'í',
  '&oacute;': 'ó',
  '&uacute;': 'ú',
  '&atilde;': 'ã',
  '&otilde;': 'õ',
  '&ccedil;': 'ç',
  '&nbsp;': ' ',
  '&amp;': 'e',
  '&hellip;': '…',
};

const stripHtml = (html = '') =>
  html
    .replace(/<\/(p|h2|h3|li|ul|ol|blockquote)>/gi, '. ')
    .replace(/<br\s*\/?>/gi, '. ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? ' ')
    .replace(/\s*\.\s*\.\s*/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Monta o texto falado a partir de um signal. Começa pelo título (pra o
 * ouvinte saber o que está ouvindo), depois a resposta direta e, quando há,
 * o corpo dos chunks. Texto limpo, sem HTML, pronto pra narração.
 */
export const buildNarration = (signal) => {
  const parts = [];
  if (signal.title) parts.push(`${signal.title.trim()}.`);
  if (signal.answer) parts.push(signal.answer.trim());

  for (const chunk of signal.chunks ?? []) {
    const text = stripHtml(chunk.html);
    if (text) parts.push(text);
    if (parts.join(' ').length > MAX_NARRATION_CHARS) break;
  }

  const full = parts.join('\n\n').replace(/\.\s*\./g, '.');
  return full.length > MAX_NARRATION_CHARS
    ? `${full.slice(0, MAX_NARRATION_CHARS).replace(/\s+\S*$/, '')}…`
    : full;
};

export const isTtsConfigured = () => Boolean(env.ELEVENLABS_API_KEY);

/**
 * Chama a ElevenLabs e devolve o áudio (audio/mpeg) como ArrayBuffer.
 * Lança se a chave não estiver configurada ou se a API falhar — quem chama
 * decide o fallback (no caso, o player cai pro modo simulado).
 */
export const synthesizeSpeech = async (text, { signal } = {}) => {
  if (!env.ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY não configurada');
  }

  const voiceId = env.ELEVENLABS_VOICE_ID;
  const res = await fetch(`${ELEVENLABS_TTS_URL}/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: env.ELEVENLABS_MODEL,
      voice_settings: VOICE_SETTINGS,
    }),
    signal,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`ElevenLabs falhou: ${res.status} ${detail.slice(0, 120)}`);
  }

  return res.arrayBuffer();
};
