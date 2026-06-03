import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env.js';
import { badRequest } from '../../errors/factories.js';
import { INSTAGRAM_ERRORS } from '../../constants/instagram.js';
import { prompts } from './prompts.js';

const MAX_TOKENS = 2400;
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

const extractText = (message) => {
  const block = message?.content?.find((c) => c.type === 'text');
  if (!block?.text) throw badRequest(INSTAGRAM_ERRORS.ANTHROPIC_INVALID_OUTPUT);
  return stripFences(block.text);
};

const parseJson = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    throw badRequest(INSTAGRAM_ERRORS.ANTHROPIC_INVALID_OUTPUT);
  }
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
  return parseJson(extractText(message));
};
