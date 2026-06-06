import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env.js';
import { GENERATION_DEFAULTS, GENERATION_ERRORS } from '../../constants/generation.js';
import { badRequest } from '../../errors/factories.js';

const MAX_TOKENS = 8000;

const buildClient = () => {
  if (!env.ANTHROPIC_API_KEY) throw badRequest(GENERATION_ERRORS.ANTHROPIC_KEY_MISSING);
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, timeout: GENERATION_DEFAULTS.TIMEOUT_MS });
};

const stripFences = (text) =>
  text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

const extractText = (message) => {
  const block = message?.content?.find((c) => c.type === 'text');
  if (!block?.text) throw badRequest(GENERATION_ERRORS.ANTHROPIC_CALL_FAILED);
  return stripFences(block.text);
};

const parseJson = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    throw badRequest(GENERATION_ERRORS.ANTHROPIC_INVALID_OUTPUT);
  }
};

const buildSchemaInstruction = (jsonSchema) =>
  [
    'Sua resposta DEVE ser um objeto JSON valido, sem comentarios, sem markdown e sem cercas de codigo.',
    'O JSON DEVE corresponder exatamente ao seguinte JSON Schema (todos os campos required, sem properties extras):',
    JSON.stringify(jsonSchema),
  ].join('\n');

export const completeStructured = async ({ system, user, jsonSchema, model }) => {
  const client = buildClient();
  const fullSystem = [system, '', buildSchemaInstruction(jsonSchema)].join('\n');
  const message = await client.messages.create({
    model: model ?? env.ANTHROPIC_MODEL,
    max_tokens: MAX_TOKENS,
    temperature: GENERATION_DEFAULTS.TEMPERATURE,
    system: fullSystem,
    messages: [{ role: 'user', content: user }],
  });
  return parseJson(extractText(message));
};
