import OpenAI from 'openai';
import { env } from '../../config/env.js';
import { MEDIA_DEFAULTS, MEDIA_ERRORS } from '../../constants/media.js';

const KIND_DESCRIPTORS = Object.freeze({
  prayer: 'a Catholic prayer',
  psalm: 'a biblical psalm',
  devotional: 'a Christian devotional',
  reflection: 'a spiritual reflection',
  verse: 'a Bible verse',
  novena: 'a novena prayer',
});

export const buildImagePrompt = (signal) => {
  const kind = KIND_DESCRIPTORS[signal.kind] ?? 'a devotional';
  return [
    `Serene devotional illustration for ${kind}.`,
    `Theme: ${signal.topicSlug.replace(/-/g, ' ')}.`,
    'Warm golden light, soft sacred atmosphere, Catholic aesthetic.',
    'Painterly style, no text, no words, no letters.',
    'Aspect ratio 1:1.',
  ].join(' ');
};

export const generateImage = async (signal) => {
  if (!env.OPENAI_API_KEY) throw new Error(MEDIA_ERRORS.ELEVENLABS_KEY_MISSING);

  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const response = await client.images.generate({
    model: MEDIA_DEFAULTS.IMAGE_MODEL,
    prompt: buildImagePrompt(signal),
    size: MEDIA_DEFAULTS.IMAGE_SIZE,
    quality: MEDIA_DEFAULTS.IMAGE_QUALITY,
    n: 1,
    response_format: 'url',
  });

  const tempUrl = response.data[0].url;
  const res = await fetch(tempUrl);
  if (!res.ok) throw new Error(MEDIA_ERRORS.OPENAI_IMAGE_FAILED);
  return Buffer.from(await res.arrayBuffer());
};
