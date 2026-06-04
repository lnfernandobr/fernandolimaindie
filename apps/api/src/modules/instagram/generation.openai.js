import OpenAI from 'openai';
import { env } from '../../config/env.js';
import { INSTAGRAM_DEFAULTS, INSTAGRAM_ERRORS } from '../../constants/instagram.js';
import { prompts } from './prompts.js';
import { IMAGE_SAFE_SUFFIX, isImageSafetyError } from './image.safety.js';

const DEFAULT_TIMEOUT = 180000;

const buildClient = () => {
  if (!env.OPENAI_API_KEY) throw new Error(INSTAGRAM_ERRORS.OPENAI_KEY_MISSING);
  return new OpenAI({ apiKey: env.OPENAI_API_KEY, timeout: DEFAULT_TIMEOUT });
};

const fetchUrlAsBuffer = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(INSTAGRAM_ERRORS.OPENAI_IMAGE_FAILED);
  return Buffer.from(await res.arrayBuffer());
};

const callImage = async (client, prompt) => {
  const response = await client.images.generate({
    model: env.OPENAI_IMAGE_MODEL,
    prompt,
    size: INSTAGRAM_DEFAULTS.IMAGE_SIZE,
    quality: INSTAGRAM_DEFAULTS.IMAGE_QUALITY,
    n: 1,
  });
  const item = response?.data?.[0];
  if (!item) throw new Error(INSTAGRAM_ERRORS.OPENAI_IMAGE_FAILED);
  if (item.b64_json) return Buffer.from(item.b64_json, 'base64');
  if (item.url) return fetchUrlAsBuffer(item.url);
  throw new Error(INSTAGRAM_ERRORS.OPENAI_IMAGE_FAILED);
};

export const generateSlideImage = async ({ channelHandle, visualAnchors, slide, slideNumber, totalSlides }) => {
  const client = buildClient();
  const prompt = prompts.slideImage({ channelHandle, visualAnchors, slide, slideNumber, totalSlides });
  try {
    return { buffer: await callImage(client, prompt), prompt };
  } catch (err) {
    if (!isImageSafetyError(err)) throw err;
    // Moderação rejeitou: re-tenta uma vez com a restrição de segurança reforçada.
    const safePrompt = prompt + IMAGE_SAFE_SUFFIX;
    return { buffer: await callImage(client, safePrompt), prompt: safePrompt };
  }
};
