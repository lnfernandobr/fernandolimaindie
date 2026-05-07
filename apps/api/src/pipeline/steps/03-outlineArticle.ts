import { outlineArticle } from '../../ai/index.js';
import type { PipelineStep } from '../types.js';

/**
 * Etapa 3 — Outline detalhado do artigo.
 *
 * Antes de escrever uma linha, define a estrutura: H2s, answer-first de cada
 * seção, "mustInclude" (dados/exemplos obrigatórios), tabelas/listas e FAQ.
 *
 * Outline forte = artigo focado. Sem essa etapa, modelos divagam.
 */
export const outlineArticleStep: PipelineStep = async (ctx) => {
  const { channel, topic } = ctx;
  if (!topic) throw new Error('outline: topic missing');

  ctx.outline = await outlineArticle({
    refinedTitle: topic.refinedTitle,
    primaryKeyword: topic.selected.primaryKeyword,
    secondaryKeywords: topic.selected.secondaryKeywords,
    intent: topic.selected.intent,
    format: topic.selected.format,
    audienceLevel: topic.selected.audienceLevel,
    niche: channel.niche,
    language: channel.language || 'pt-BR',
    channelName: channel.name,
    targetReadingMinutes: ctx.targetReadingMinutes,
  });
};
