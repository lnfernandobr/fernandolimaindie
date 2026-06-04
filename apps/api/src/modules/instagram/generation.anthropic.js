import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { badRequest } from '../../errors/factories.js';
import { INSTAGRAM_ERRORS } from '../../constants/instagram.js';
import { prompts } from './prompts.js';

const MAX_TOKENS = 8000; // folga p/ captions longos (ex: orações completas) sem truncar
const TEMPERATURE = 0.7;

const buildClient = () => {
  if (!env.ANTHROPIC_API_KEY) throw badRequest(INSTAGRAM_ERRORS.ANTHROPIC_KEY_MISSING);
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
};

const stripFences = (text) =>
  text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

// Extrai o primeiro objeto JSON balanceado do texto, tolerando preâmbulo/sufixo
// do modelo. Respeita strings (aspas/escape) pra não fechar em chave dentro de texto.
const extractJsonObject = (text) => {
  const start = text.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
    } else if (ch === '"') {
      inStr = true;
    } else if (ch === '{') {
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null; // não fechou → resposta truncada
};

export const generateCarouselPlan = async ({ channel, topic, brief, slidesCount }) => {
  const client = buildClient();
  const { system, user } = prompts.carouselPlan({ channel, topic, brief, slidesCount });
  const message = await client.messages.create({
    model: env.ANTHROPIC_MODEL,
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    system,
    messages: [{ role: 'user', content: user }],
  });

  const block = message?.content?.find((c) => c.type === 'text');
  const raw = block?.text ? stripFences(block.text) : '';
  const json = extractJsonObject(raw);
  if (!json) {
    logger.warn(
      { topic, stopReason: message?.stop_reason, len: raw.length, tail: raw.slice(-180) },
      'carousel plan: JSON não extraível (provável truncamento)',
    );
    throw badRequest(INSTAGRAM_ERRORS.ANTHROPIC_INVALID_OUTPUT);
  }
  try {
    return JSON.parse(json);
  } catch (err) {
    logger.warn({ topic, err: err.message, head: json.slice(0, 180) }, 'carousel plan: JSON.parse falhou');
    throw badRequest(INSTAGRAM_ERRORS.ANTHROPIC_INVALID_OUTPUT);
  }
};
