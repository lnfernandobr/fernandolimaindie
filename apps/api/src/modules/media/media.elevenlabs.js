import { env } from '../../config/env.js';
import { MEDIA_DEFAULTS, MEDIA_ERRORS } from '../../constants/media.js';

const ELEVENLABS_API = 'https://api.elevenlabs.io/v1/text-to-speech';

export const generateSpeech = async (text) => {
  if (!env.ELEVENLABS_API_KEY) throw new Error(MEDIA_ERRORS.ELEVENLABS_KEY_MISSING);

  const voiceId = env.ELEVENLABS_VOICE_ID || MEDIA_DEFAULTS.ELEVENLABS_VOICE_ID;

  const res = await fetch(`${ELEVENLABS_API}/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': env.ELEVENLABS_API_KEY,
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
