import OpenAI from 'openai';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { INSTAGRAM_DEFAULTS, INSTAGRAM_ERRORS, INSTAGRAM_VIDEO } from '../../constants/instagram.js';
import { prompts } from './prompts.js';
import { IMAGE_SAFE_SUFFIX, isImageSafetyError } from './image.safety.js';
import { hasFal, runFalJob, downloadFalFile, readConfigFile } from './fal.client.js';

const DEFAULT_TIMEOUT = 180000;
const FLUX_MODEL = 'fal-ai/flux-2-pro';
const IMAGE_MODEL_FILE = process.env.IMAGE_MODEL_FILE || '/opt/media/secrets/image_model';

// ── FLUX (fal.ai) ──────────────────────────────────────────────────────────
// Modelo de imagem com moderação bem mais leve que a OpenAI (não bloqueia temas
// religiosos/históricos como o gpt-image). safety_checker desligado + tolerância máxima.
const generateSceneImageFlux = async ({ visualAnchors, scene, sceneNumber, totalScenes, variant }) => {
  const v = INSTAGRAM_VIDEO.VARIANTS[variant];
  const prompt = prompts.sceneImage({ visualAnchors, scene, sceneNumber, totalScenes, aspect: v.aspect });
  const [width, height] = v.imageSize.split('x').map(Number);
  const data = await runFalJob(FLUX_MODEL, {
    prompt,
    image_size: { width, height },
    enable_safety_checker: false,
    safety_tolerance: '5',
    output_format: 'png',
  });
  const url = data?.images?.[0]?.url;
  if (!url) throw new Error('flux: sem image url');
  return downloadFalFile(url);
};

// ── OpenAI gpt-image-2 (fallback) ──────────────────────────────────────────
const buildClient = () => {
  if (!env.OPENAI_API_KEY) throw new Error(INSTAGRAM_ERRORS.OPENAI_KEY_MISSING);
  return new OpenAI({ apiKey: env.OPENAI_API_KEY, timeout: DEFAULT_TIMEOUT });
};

const fetchUrlAsBuffer = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(INSTAGRAM_ERRORS.VIDEO_IMAGE_FAILED);
  return Buffer.from(await res.arrayBuffer());
};

const callImage = async (client, prompt, size) => {
  const response = await client.images.generate({
    model: env.OPENAI_IMAGE_MODEL,
    prompt,
    size,
    quality: INSTAGRAM_DEFAULTS.IMAGE_QUALITY,
    n: 1,
  });
  const item = response?.data?.[0];
  if (!item) throw new Error(INSTAGRAM_ERRORS.VIDEO_IMAGE_FAILED);
  if (item.b64_json) return Buffer.from(item.b64_json, 'base64');
  if (item.url) return fetchUrlAsBuffer(item.url);
  throw new Error(INSTAGRAM_ERRORS.VIDEO_IMAGE_FAILED);
};

const generateSceneImageOpenAI = async ({ visualAnchors, scene, sceneNumber, totalScenes, variant }) => {
  const v = INSTAGRAM_VIDEO.VARIANTS[variant];
  const client = buildClient();
  const prompt = prompts.sceneImage({ visualAnchors, scene, sceneNumber, totalScenes, aspect: v.aspect });
  try {
    return await callImage(client, prompt, v.imageSize);
  } catch (err) {
    if (!isImageSafetyError(err)) throw err;
    return callImage(client, prompt + IMAGE_SAFE_SUFFIX, v.imageSize);
  }
};

// Usa FLUX (fal.ai) quando há chave fal e o config não força openai; cai no gpt-image
// se o FLUX falhar. Sem chave fal, usa gpt-image direto. Toggle: arquivo image_model.
const useFlux = () => hasFal() && readConfigFile(IMAGE_MODEL_FILE, 'IMAGE_MODEL', 'flux') !== 'openai';

export const generateSceneImage = async (args) => {
  const v = INSTAGRAM_VIDEO.VARIANTS[args.variant];
  if (!v) throw new Error(INSTAGRAM_ERRORS.VIDEO_VARIANT_INVALID);
  if (useFlux()) {
    try {
      return await generateSceneImageFlux(args);
    } catch (err) {
      logger.warn({ err: err.message }, 'FLUX falhou — fallback gpt-image-2');
    }
  }
  return generateSceneImageOpenAI(args);
};
