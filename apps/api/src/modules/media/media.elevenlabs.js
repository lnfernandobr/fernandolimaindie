import { existsSync, readFileSync } from 'node:fs';
import { env } from '../../config/env.js';
import { MEDIA_DEFAULTS, MEDIA_ERRORS } from '../../constants/media.js';

const ELEVENLABS_API = 'https://api.elevenlabs.io/v1/text-to-speech';

// A chave pode vir de um arquivo protegido no host (precedência sobre o ambiente/Doppler).
// Usado porque o token do Doppler no servidor é somente-leitura — então a chave fica
// num arquivo chmod 600 fora do git (sobrevive aos deploys). Override via ELEVENLABS_API_KEY_FILE.
const KEY_FILE = process.env.ELEVENLABS_API_KEY_FILE || '/opt/media/secrets/elevenlabs.key';

const resolveApiKey = () => {
  try {
    if (existsSync(KEY_FILE)) {
      const fromFile = readFileSync(KEY_FILE, 'utf8').trim();
      if (fromFile) return fromFile;
    }
  } catch {
    /* sem acesso ao arquivo — cai no ambiente */
  }
  return env.ELEVENLABS_API_KEY;
};

export const generateSpeech = async (text) => {
  const apiKey = resolveApiKey();
  if (!apiKey) throw new Error(MEDIA_ERRORS.ELEVENLABS_KEY_MISSING);

  const voiceId = env.ELEVENLABS_VOICE_ID || MEDIA_DEFAULTS.ELEVENLABS_VOICE_ID;

  const res = await fetch(`${ELEVENLABS_API}/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: MEDIA_DEFAULTS.ELEVENLABS_MODEL,
      voice_settings: {
        stability: MEDIA_DEFAULTS.ELEVENLABS_STABILITY,
        similarity_boost: MEDIA_DEFAULTS.ELEVENLABS_SIMILARITY,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${MEDIA_ERRORS.ELEVENLABS_CALL_FAILED}: ${res.status} ${body.slice(0, 120)}`);
  }

  return Buffer.from(await res.arrayBuffer());
};
