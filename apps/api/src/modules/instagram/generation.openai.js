import OpenAI from 'openai';
import { env } from '../../config/env.js';
import { INSTAGRAM_DEFAULTS, INSTAGRAM_ERRORS } from '../../constants/instagram.js';
import { prompts } from './prompts.js';

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

export const generateSlideImage = async ({ channelHandle, visualAnchors, slide, slideNumber, totalSlides }) => {
  const client = buildClient();
  const prompt = prompts.slideImage({
    channelHandle,
    visualAnchors,
    slide,
    slideNumber,
    totalSlides,
  });
  const response = await client.images.generate({
    model: env.OPENAI_IMAGE_MODEL,
    prompt,
    size: INSTAGRAM_DEFAULTS.IMAGE_SIZE,
    quality: INSTAGRAM_DEFAULTS.IMAGE_QUALITY,
    n: 1,
  });
  const item = response?.data?.[0];
  if (!item) throw new Error(INSTAGRAM_ERRORS.OPENAI_IMAGE_FAILED);
  if (item.b64_json) return { buffer: Buffer.from(item.b64_json, 'base64'), prompt };
  if (item.url) return { buffer: await fetchUrlAsBuffer(item.url), prompt };
  throw new Error(INSTAGRAM_ERRORS.OPENAI_IMAGE_FAILED);
};
