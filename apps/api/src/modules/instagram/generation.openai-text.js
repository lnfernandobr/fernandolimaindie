import OpenAI from 'openai';
import { env } from '../../config/env.js';
import { badRequest } from '../../errors/factories.js';
import { INSTAGRAM_ERRORS } from '../../constants/instagram.js';
import { prompts } from './prompts.js';

const TIMEOUT_MS = 180000;

const buildClient = () => {
  if (!env.OPENAI_API_KEY) throw badRequest(INSTAGRAM_ERRORS.OPENAI_KEY_MISSING);
  return new OpenAI({ apiKey: env.OPENAI_API_KEY, timeout: TIMEOUT_MS });
};

const stripFences = (text) =>
  text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

const parseJson = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    throw badRequest(INSTAGRAM_ERRORS.ANTHROPIC_INVALID_OUTPUT);
  }
};

export const generateCarouselPlanWithOpenAI = async ({ channel, topic, brief, slidesCount }) => {
  const { system, user } = prompts.carouselPlan({ channel, topic, brief, slidesCount });
  const client = buildClient();
  const completion = await client.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    response_format: { type: 'json_object' },
  });
  const text = completion?.choices?.[0]?.message?.content;
  if (!text) throw badRequest(INSTAGRAM_ERRORS.ANTHROPIC_INVALID_OUTPUT);
  return parseJson(stripFences(text));
};
