import OpenAI from 'openai';
import { env } from '../../config/env.js';
import {
  GENERATION_DEFAULTS,
  GENERATION_ERRORS,
  OPENAI_RESPONSE_FORMAT_NAME,
} from '../../constants/generation.js';
import { badRequest } from '../../errors/factories.js';

const RESPONSE_FORMAT_TYPE = 'json_schema';

const buildClient = () => {
  if (!env.OPENAI_API_KEY) throw badRequest(GENERATION_ERRORS.OPENAI_KEY_MISSING);
  return new OpenAI({ apiKey: env.OPENAI_API_KEY, timeout: GENERATION_DEFAULTS.TIMEOUT_MS });
};

const extractContent = (completion) => {
  const choice = completion?.choices?.[0];
  const text = choice?.message?.content;
  if (!text) throw badRequest(GENERATION_ERRORS.OPENAI_CALL_FAILED);
  return text;
};

const parseJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    throw badRequest(GENERATION_ERRORS.OPENAI_INVALID_OUTPUT);
  }
};

export const completeStructured = async ({ system, user, jsonSchema, model }) => {
  const client = buildClient();
  const completion = await client.chat.completions.create({
    model: model ?? env.OPENAI_MODEL,
    temperature: GENERATION_DEFAULTS.TEMPERATURE,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    response_format: {
      type: RESPONSE_FORMAT_TYPE,
      json_schema: {
        name: OPENAI_RESPONSE_FORMAT_NAME,
        strict: true,
        schema: jsonSchema,
      },
    },
  });
  return parseJson(extractContent(completion));
};
