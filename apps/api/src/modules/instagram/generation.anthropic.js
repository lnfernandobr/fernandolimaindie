import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { badRequest } from '../../errors/factories.js';
import { INSTAGRAM_ERRORS } from '../../constants/instagram.js';
import { prompts } from './prompts.js';

const MAX_TOKENS = 8000;
const TEMPERATURE = 0.7;

const buildClient = () => {
  if (!env.ANTHROPIC_API_KEY) throw badRequest(INSTAGRAM_ERRORS.ANTHROPIC_KEY_MISSING);
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
};

// Tool (structured output): o Claude preenche os campos via tool_use, e o SDK devolve
// um objeto JS já válido — sem parse de texto, então captions/orações com aspas e quebras
// de linha não quebram mais o JSON.
const PLAN_TOOL = {
  name: 'emit_carousel_plan',
  description: 'Emit the final structured Instagram carousel plan.',
  input_schema: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      youtubeTitle: { type: 'string' },
      designConcept: { type: 'string' },
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
      slides: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            role: { type: 'string', enum: ['hook', 'body', 'cta'] },
            text: { type: 'string' },
            imageSubject: { type: 'string' },
            imageScene: { type: 'string' },
          },
          required: ['role', 'text', 'imageSubject', 'imageScene'],
        },
      },
      caption: { type: 'string' },
      hashtags: {
        type: 'object',
        properties: {
          high: { type: 'array', items: { type: 'string' } },
          medium: { type: 'array', items: { type: 'string' } },
          low: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    required: ['title', 'slides', 'caption', 'visualAnchors', 'hashtags'],
  },
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
    tools: [PLAN_TOOL],
    tool_choice: { type: 'tool', name: PLAN_TOOL.name },
  });

  const toolUse = message?.content?.find((c) => c.type === 'tool_use');
  if (!toolUse?.input) {
    logger.warn({ topic, stopReason: message?.stop_reason }, 'carousel plan: sem tool_use no retorno');
    throw badRequest(INSTAGRAM_ERRORS.ANTHROPIC_INVALID_OUTPUT);
  }
  return toolUse.input;
};
