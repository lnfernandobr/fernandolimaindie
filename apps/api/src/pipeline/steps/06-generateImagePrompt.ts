import { generateImagePromptBrief } from '../../ai/index.js';
import type { PipelineStep } from '../types.js';

/**
 * Etapa 6 — Brief visual da imagem.
 *
 * Roda separado de "07-generateImage" pra:
 *   - permitir trocar de provider de imagem sem refazer o brief
 *   - reusar o brief em múltiplos formatos (cover wide + thumbnail square)
 *   - permitir revisão humana do prompt antes de pagar pela imagem
 */
export const generateImagePromptStep: PipelineStep = async (ctx) => {
  const { channel, topic, article } = ctx;
  if (!topic || !article) throw new Error('imagePrompt: topic/article missing');

  ctx.imageBrief = await generateImagePromptBrief({
    channelName: channel.name,
    niche: channel.niche,
    language: channel.language,
    articleTitle: topic.refinedTitle,
    articleSummary: article.excerpt,
  });
};
