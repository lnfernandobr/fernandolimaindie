import { prompts, type ImageBriefingInput } from '../prompts/index.js';
import { getTextProvider } from '../providers/index.js';
import { buildImagePromptSchema, imageBriefingSchema } from '../schemas.js';

export interface ImageBrief {
  /** Prompt em inglês para o gerador de imagem (gpt-image-1, dall-e-3). */
  prompt: string;
  /** Negative prompt já com layers do visual.ts. */
  negativePrompt: string;
  /** Alt-text em pt-BR para acessibilidade. */
  alt: string;
  /** Mood em palavras-chave (ex: "calm, tactile, editorial"). */
  mood: string;
  provider: string;
}

/**
 * Pipeline de imagem em duas etapas (mantém o shape legacy para compat).
 *
 * Etapa 1: post → briefing visual em pt-BR (conceito, sujeito, ambiente,
 *           mood, paleta, detalhes-chave, alt). Funciona como fonte única
 *           pra qualquer formato (cover/OG/thumbnail/internal).
 * Etapa 2: briefing → prompt em inglês para gerador (cover, default).
 *
 * Pra outros formatos (OG, thumbnail, internal), use o briefing da etapa 1
 * com o prompt específico daquele formato. Está disponível via
 * `prompts.coverImage`, `prompts.ogImage`, etc.
 */
export async function generateImagePromptBrief(input: ImageBriefingInput): Promise<ImageBrief> {
  const provider = await getTextProvider();

  // Etapa 1: briefing em pt-BR.
  const { data: briefing } = await provider.generateStructured({
    schemaName: 'ImageBriefing',
    schemaDescription: 'Briefing visual conceitual em pt-BR.',
    schema: imageBriefingSchema,
    messages: [
      { role: 'system', content: prompts.imageBriefing.system },
      { role: 'user', content: prompts.imageBriefing.user(input) },
    ],
  });

  // Etapa 2: cover prompt em inglês a partir do briefing.
  const { data: cover, provider: providerName } = await provider.generateStructured({
    schemaName: 'CoverImagePrompt',
    schemaDescription: 'Prompt em inglês para gerador de imagem (cover 16:9).',
    schema: buildImagePromptSchema,
    messages: [
      { role: 'system', content: prompts.coverImage.system },
      {
        role: 'user',
        content: prompts.coverImage.user({
          channelName: input.channelName,
          niche: input.niche,
          language: input.language,
          articleTitle: input.articleTitle,
          briefing: {
            concept: briefing.concept,
            subject: briefing.subject,
            setting: briefing.setting,
            mood: briefing.mood,
            palette: briefing.palette,
            keyDetails: briefing.keyDetails,
          },
          usage: 'cover',
        }),
      },
    ],
  });

  return {
    prompt: cover.prompt.slice(0, 1500),
    negativePrompt: cover.negativePrompt.slice(0, 800),
    alt: briefing.alt.slice(0, 200),
    mood: briefing.mood.slice(0, 60),
    provider: providerName,
  };
}
