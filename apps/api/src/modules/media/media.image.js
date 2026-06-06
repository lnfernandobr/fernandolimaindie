import OpenAI from 'openai';
import { env } from '../../config/env.js';
import { MEDIA_DEFAULTS, MEDIA_ERRORS } from '../../constants/media.js';

const KIND_DESCRIPTORS = Object.freeze({
  prayer: 'a Catholic prayer',
  psalm: 'a biblical psalm',
  devotional: 'a Christian devotional',
  reflection: 'a spiritual reflection',
  verse: 'a Bible verse',
  verse_collection: 'a collection of Bible verses',
  article: 'a faith article',
  novena: 'a novena prayer',
});

// Trilhos fixos de direção de arte: garantem uma capa editorial impactante e
// matam o visual genérico de IA / banco de imagens / marca d'água falsa.
const ART_RAILS = [
  '# Art direction (mandatory)',
  'Editorial, magazine-cover quality. ONE strong focal subject, intentional composition, real depth.',
  'Cinematic natural light and a deliberate color palette that fits the emotion. Avoid muddy grey/sepia defaults; commit to light and color.',
  'Photographic or finely painted, tactile and real — NOT generic AI art, NOT clipart, NOT a stock-photo cliché.',
  '# Hard restrictions (must be ABSENT)',
  'NO text, letters, words, captions, signs, numbers, watermarks, logos, UI, borders or frames anywhere.',
  'No distorted hands or faces, no extra fingers, no plastic 3D render, no oversaturation, no HDR halos, no symmetric AI face.',
  '# Format',
  'Wide 3:2 landscape hero, full-bleed, publish-ready.',
];

// Fallback para signals antigos, gerados antes de o Claude emitir o imagePrompt.
const legacyBrief = (signal) => {
  const kind = KIND_DESCRIPTORS[signal.kind] ?? 'a devotional';
  const theme = signal.title || (signal.topicSlug ?? '').replace(/-/g, ' ');
  return [
    `An evocative, symbolic editorial cover image for ${kind}, themed around "${theme}".`,
    'Choose ONE concrete symbolic scene or object (hands, light through a window, an open door, a path, bread on a table, a single candle) — never a literal religious cliché.',
    'Cinematic natural light, intentional color, shallow depth of field.',
  ].join(' ');
};

export const buildImagePrompt = (signal) => {
  const directed = String(signal.imagePrompt ?? '').trim();
  const scene = directed || legacyBrief(signal);
  return ['# Scene', scene, '', ...ART_RAILS].join('\n');
};

export const generateImage = async (signal) => {
  if (!env.OPENAI_API_KEY) throw new Error(MEDIA_ERRORS.OPENAI_IMAGE_FAILED);

  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const response = await client.images.generate({
    model: env.OPENAI_IMAGE_MODEL,
    prompt: buildImagePrompt(signal),
    size: MEDIA_DEFAULTS.IMAGE_SIZE,
    quality: MEDIA_DEFAULTS.IMAGE_QUALITY,
    n: 1,
  });

  const item = response?.data?.[0];
  if (!item) throw new Error(MEDIA_ERRORS.OPENAI_IMAGE_FAILED);
  if (item.b64_json) return Buffer.from(item.b64_json, 'base64');
  if (item.url) {
    const res = await fetch(item.url);
    if (!res.ok) throw new Error(MEDIA_ERRORS.OPENAI_IMAGE_FAILED);
    return Buffer.from(await res.arrayBuffer());
  }
  throw new Error(MEDIA_ERRORS.OPENAI_IMAGE_FAILED);
};
