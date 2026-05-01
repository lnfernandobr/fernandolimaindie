import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import type { AIProvider } from '../types.js';
import { ClaudeProvider } from './ClaudeProvider.js';
import { MockProvider } from './MockProvider.js';
import { OpenAIProvider } from './OpenAIProvider.js';

let textProvider: AIProvider | null = null;
let imageProvider: AIProvider | null = null;

/**
 * Provider de texto (gerador de artigo, metadata, brainstorm, etc.).
 *
 * Configurado por AI_PROVIDER=mock|claude|openai. Cai pra mock se a chave
 * do provider escolhido estiver ausente (defesa contra config incompleto).
 */
export function getTextProvider(): AIProvider {
  if (textProvider) return textProvider;

  let candidate: AIProvider;
  switch (env.AI_PROVIDER) {
    case 'claude':
      candidate = new ClaudeProvider({ apiKey: env.ANTHROPIC_API_KEY, model: env.AI_MODEL });
      break;
    case 'openai':
      candidate = new OpenAIProvider({ apiKey: env.OPENAI_API_KEY, textModel: env.AI_MODEL });
      break;
    case 'mock':
    default:
      candidate = new MockProvider();
      break;
  }

  if (!candidate.enabled) {
    logger.warn(
      { configured: env.AI_PROVIDER },
      'AI text provider não habilitado (chave faltando) — caindo pra mock',
    );
    candidate = new MockProvider();
  }

  textProvider = candidate;
  logger.info({ provider: textProvider.name }, 'AI text provider ready');
  return textProvider;
}

/**
 * Provider de imagem (cover de post).
 *
 * Configurado por IMAGE_PROVIDER=mock|openai (independente de AI_PROVIDER).
 * Em produção típica, AI_PROVIDER=claude + IMAGE_PROVIDER=openai (Anthropic
 * não gera imagem).
 */
export function getImageProvider(): AIProvider {
  if (imageProvider) return imageProvider;

  let candidate: AIProvider;
  switch (env.IMAGE_PROVIDER) {
    case 'openai':
      candidate = new OpenAIProvider({ apiKey: env.OPENAI_API_KEY, imageModel: env.IMAGE_MODEL });
      break;
    case 'mock':
    default:
      candidate = new MockProvider();
      break;
  }

  if (!candidate.enabled) {
    logger.warn(
      { configured: env.IMAGE_PROVIDER },
      'AI image provider não habilitado — caindo pra mock',
    );
    candidate = new MockProvider();
  }

  imageProvider = candidate;
  logger.info({ provider: imageProvider.name }, 'AI image provider ready');
  return imageProvider;
}

export function __resetAIProviders(): void {
  textProvider = null;
  imageProvider = null;
}
