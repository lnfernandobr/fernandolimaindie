import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { Setting, SETTINGS_KEY } from '../../models/Setting.js';
import type { AIProvider } from '../types.js';
import { ClaudeProvider } from './ClaudeProvider.js';
import { MockProvider } from './MockProvider.js';
import { OpenAIProvider } from './OpenAIProvider.js';

let textProvider: AIProvider | null = null;
let imageProvider: AIProvider | null = null;

interface ResolvedConfig {
  aiProvider: 'mock' | 'claude' | 'openai';
  aiModel: string | null;
  imageProvider: 'mock' | 'openai';
  imageModel: string | null;
}

async function resolveConfig(): Promise<ResolvedConfig> {
  // Mongo é a fonte da verdade quando o admin já configurou. Se ainda não
  // existe doc de settings, caímos pros valores de env (template/dev).
  const doc = await Setting.findOne({ key: SETTINGS_KEY }).lean().catch(() => null);
  return {
    aiProvider: (doc?.aiProvider as ResolvedConfig['aiProvider']) ?? env.AI_PROVIDER,
    aiModel: doc?.aiModel ?? (env.AI_MODEL || null),
    imageProvider: (doc?.imageProvider as ResolvedConfig['imageProvider']) ?? env.IMAGE_PROVIDER,
    imageModel: doc?.imageModel ?? (env.IMAGE_MODEL || null),
  };
}

function buildTextProvider(cfg: ResolvedConfig): AIProvider {
  let candidate: AIProvider;
  switch (cfg.aiProvider) {
    case 'claude':
      candidate = new ClaudeProvider({
        apiKey: env.ANTHROPIC_API_KEY,
        model: cfg.aiModel ?? env.AI_MODEL,
      });
      break;
    case 'openai':
      candidate = new OpenAIProvider({
        apiKey: env.OPENAI_API_KEY,
        textModel: cfg.aiModel ?? env.AI_MODEL,
      });
      break;
    case 'mock':
    default:
      candidate = new MockProvider();
      break;
  }
  if (!candidate.enabled) {
    logger.warn(
      { configured: cfg.aiProvider },
      'AI text provider não habilitado (chave faltando) — caindo pra mock',
    );
    candidate = new MockProvider();
  }
  return candidate;
}

function buildImageProvider(cfg: ResolvedConfig): AIProvider {
  let candidate: AIProvider;
  switch (cfg.imageProvider) {
    case 'openai':
      candidate = new OpenAIProvider({
        apiKey: env.OPENAI_API_KEY,
        imageModel: cfg.imageModel ?? env.IMAGE_MODEL,
      });
      break;
    case 'mock':
    default:
      candidate = new MockProvider();
      break;
  }
  if (!candidate.enabled) {
    logger.warn(
      { configured: cfg.imageProvider },
      'AI image provider não habilitado — caindo pra mock',
    );
    candidate = new MockProvider();
  }
  return candidate;
}

/**
 * Provider de texto (gerador de artigo, metadata, brainstorm, etc.).
 *
 * Lê config do Mongo (Setting singleton). Cai pra env vars se admin ainda
 * não configurou. Cacheado em memória — chame `__resetAIProviders()` ao
 * salvar settings pra forçar reload.
 */
export async function getTextProvider(): Promise<AIProvider> {
  if (textProvider) return textProvider;
  const cfg = await resolveConfig();
  textProvider = buildTextProvider(cfg);
  logger.info({ provider: textProvider.name }, 'AI text provider ready');
  return textProvider;
}

/**
 * Provider de imagem (cover de post).
 *
 * Configurado independente do text provider — em prod típica é
 * AI_PROVIDER=claude + IMAGE_PROVIDER=openai (Anthropic não gera imagem).
 */
export async function getImageProvider(): Promise<AIProvider> {
  if (imageProvider) return imageProvider;
  const cfg = await resolveConfig();
  imageProvider = buildImageProvider(cfg);
  logger.info({ provider: imageProvider.name }, 'AI image provider ready');
  return imageProvider;
}

/**
 * Reseta o cache. Próximo getTextProvider/getImageProvider relê o Mongo.
 * Chamar após salvar Settings.
 */
export function __resetAIProviders(): void {
  textProvider = null;
  imageProvider = null;
}

/**
 * Pega a config "efetiva" sem instanciar provider — usada na resposta da
 * GET /settings pra mostrar no admin se o provider configurado caiu pra mock
 * por chave faltando.
 */
export async function getEffectiveProviders(): Promise<{
  effectiveAi: 'mock' | 'claude' | 'openai';
  effectiveImage: 'mock' | 'openai';
  config: ResolvedConfig;
}> {
  const cfg = await resolveConfig();
  const text = buildTextProvider(cfg);
  const img = buildImageProvider(cfg);
  return {
    effectiveAi: text.name as 'mock' | 'claude' | 'openai',
    effectiveImage: img.name as 'mock' | 'openai',
    config: cfg,
  };
}
