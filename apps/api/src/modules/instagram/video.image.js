import OpenAI from 'openai';
import { env } from '../../config/env.js';
import { INSTAGRAM_DEFAULTS, INSTAGRAM_ERRORS, INSTAGRAM_VIDEO } from '../../constants/instagram.js';
import { prompts } from './prompts.js';

const DEFAULT_TIMEOUT = 180000;

const buildClient = () => {
  if (!env.OPENAI_API_KEY) throw new Error(INSTAGRAM_ERRORS.OPENAI_KEY_MISSING);
  return new OpenAI({ apiKey: env.OPENAI_API_KEY, timeout: DEFAULT_TIMEOUT });
};

const fetchUrlAsBuffer = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(INSTAGRAM_ERRORS.VIDEO_IMAGE_FAILED);
  return Buffer.from(await res.arrayBuffer());
};

// Gera a imagem (PNG buffer) de UMA cena no tamanho/aspecto da variante.
export const generateSceneImage = async ({ visualAnchors, scene, sceneNumber, totalScenes, variant }) => {
  const v = INSTAGRAM_VIDEO.VARIANTS[variant];
  if (!v) throw new Error(INSTAGRAM_ERRORS.VIDEO_VARIANT_INVALID);
  const client = buildClient();
  const prompt = prompts.sceneImage({
    visualAnchors,
    scene,
    sceneNumber,
    totalScenes,
    aspect: v.aspect,
  });
  const response = await client.images.generate({
    model: env.OPENAI_IMAGE_MODEL,
    prompt,
    size: v.imageSize,
    quality: INSTAGRAM_DEFAULTS.IMAGE_QUALITY,
    n: 1,
  });
  const item = response?.data?.[0];
  if (!item) throw new Error(INSTAGRAM_ERRORS.VIDEO_IMAGE_FAILED);
  if (item.b64_json) return Buffer.from(item.b64_json, 'base64');
  if (item.url) return fetchUrlAsBuffer(item.url);
  throw new Error(INSTAGRAM_ERRORS.VIDEO_IMAGE_FAILED);
};
