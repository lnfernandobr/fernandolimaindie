import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { badRequest } from '../../errors/factories.js';
import { INSTAGRAM_ERRORS, INSTAGRAM_VIDEO } from '../../constants/instagram.js';
import { prompts } from './prompts.js';

const MAX_TOKENS = 8000; // roteiro longo (até ~36 cenas) com folga
const TEMPERATURE = 0.8;

const buildClient = () => {
  if (!env.ANTHROPIC_API_KEY) throw badRequest(INSTAGRAM_ERRORS.ANTHROPIC_KEY_MISSING);
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
};

// Tool (structured output): o Claude devolve um objeto JS já válido — sem parse de texto,
// então narração/roteiro com aspas e quebras de linha não quebram mais o JSON.
const SCRIPT_TOOL = {
  name: 'emit_video_script',
  description: 'Emit the final structured faceless video script.',
  input_schema: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      bgColor: { type: 'string' },
      musicMood: { type: 'string' },
      visualAnchors: {
        type: 'object',
        properties: {
          medium: { type: 'string' },
          palette: { type: 'string' },
          lighting: { type: 'string' },
          lensOrTechnique: { type: 'string' },
          composition: { type: 'string' },
          texture: { type: 'string' },
          reference: { type: 'string' },
        },
      },
      scenes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            narration: { type: 'string' },
            imagePrompt: { type: 'string' },
            onScreenText: { type: 'string' },
          },
          required: ['narration', 'imagePrompt'],
        },
      },
    },
    required: ['scenes', 'visualAnchors'],
  },
};

const truncate = (value, limit) => {
  const str = String(value ?? '').trim();
  return str.length > limit ? str.slice(0, limit) : str;
};

// Nº de cenas da variante: ~1 imagem a cada secondsPerScene, dentro de [min,max].
export const sceneCountFor = (variantKey) => {
  const v = INSTAGRAM_VIDEO.VARIANTS[variantKey];
  if (!v) throw badRequest(INSTAGRAM_ERRORS.VIDEO_VARIANT_INVALID);
  const raw = Math.round(v.targetSeconds / v.secondsPerScene);
  return Math.min(Math.max(raw, v.minScenes), v.maxScenes);
};

const normalizeAnchors = (a) => ({
  medium: truncate(a?.medium, 400),
  palette: truncate(a?.palette, 400),
  lighting: truncate(a?.lighting, 400),
  lensOrTechnique: truncate(a?.lensOrTechnique || a?.lens || a?.technique, 400),
  composition: truncate(a?.composition, 400),
  texture: truncate(a?.texture, 400),
  reference: truncate(a?.reference, 400),
});

const HEX = /^#?[0-9a-fA-F]{6}$/;
const normalizeColor = (c) => {
  const s = String(c ?? '').trim();
  if (!HEX.test(s)) return '#111418';
  return s.startsWith('#') ? s : `#${s}`;
};

const validateScript = (raw, sceneCount) => {
  if (!raw || !Array.isArray(raw.scenes)) {
    throw badRequest(INSTAGRAM_ERRORS.ANTHROPIC_INVALID_OUTPUT);
  }
  const scenes = raw.scenes
    .slice(0, sceneCount)
    .map((s) => ({
      narration: truncate(s?.narration, 600),
      imagePrompt: truncate(s?.imagePrompt, 1000),
      onScreenText: truncate(s?.onScreenText, 80),
    }))
    .filter((s) => s.imagePrompt || s.narration);
  if (!scenes.length) throw badRequest(INSTAGRAM_ERRORS.ANTHROPIC_INVALID_OUTPUT);
  return {
    title: truncate(raw.title, 100),
    bgColor: normalizeColor(raw.bgColor),
    musicMood: truncate(raw.musicMood, 120),
    visualAnchors: normalizeAnchors(raw.visualAnchors),
    scenes,
  };
};

// Roteiro de teste (mock) — usado quando não há chave/Claude, pra validar o render.
export const buildMockScript = ({ post, variant }) => {
  const count = sceneCountFor(variant);
  const scenes = Array.from({ length: count }, (_, i) => ({
    narration: `Cena ${i + 1} sobre ${post.topic}. Uma frase de narração de exemplo para o teste do vídeo.`,
    imagePrompt: `cinematic still, scene ${i + 1}, soft natural light, shallow depth of field, no text`,
    onScreenText: `Cena ${i + 1}`,
  }));
  return {
    title: truncate(post.title || post.topic, 100),
    bgColor: '#111418',
    musicMood: 'calm acoustic hopeful',
    visualAnchors: normalizeAnchors({
      medium: 'documentary photograph on 35mm film',
      palette: 'muted earth tones',
      lighting: 'soft window light',
      lensOrTechnique: '50mm at f/2, shallow depth of field',
      composition: 'rule of thirds, generous negative space',
      texture: 'fine film grain',
      reference: 'quiet editorial photography',
    }),
    scenes,
  };
};

// Gera o roteiro do vídeo via Claude, validado e normalizado.
export const generateVideoScript = async ({ post, channel, variant }) => {
  const v = INSTAGRAM_VIDEO.VARIANTS[variant];
  if (!v) throw badRequest(INSTAGRAM_ERRORS.VIDEO_VARIANT_INVALID);
  const sceneCount = sceneCountFor(variant);
  const client = buildClient();
  const { system, user } = prompts.videoScript({
    channel,
    post,
    variant: v,
    sceneCount,
    targetSeconds: v.targetSeconds,
  });
  const message = await client.messages.create({
    model: env.ANTHROPIC_MODEL,
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    system,
    messages: [{ role: 'user', content: user }],
    tools: [SCRIPT_TOOL],
    tool_choice: { type: 'tool', name: SCRIPT_TOOL.name },
  });
  const toolUse = message?.content?.find((c) => c.type === 'tool_use');
  if (!toolUse?.input) {
    logger.warn({ variant, stopReason: message?.stop_reason }, 'video script: sem tool_use no retorno');
    throw badRequest(INSTAGRAM_ERRORS.ANTHROPIC_INVALID_OUTPUT);
  }
  return validateScript(toolUse.input, sceneCount);
};
