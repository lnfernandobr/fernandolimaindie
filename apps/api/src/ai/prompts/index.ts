/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  Arquitetura de Prompts (texto + imagem).
 *
 *  Estrutura modular por dimensão (não por skill). Cada módulo cobre um
 *  aspecto:
 *
 *    blocks.ts      Building blocks (PERSONA, EDITORIAL, SEO_GEO, CTA, etc).
 *                   Sem lógica de skill, só o vocabulário compartilhado.
 *
 *    brand.ts       Brand profile (channel-aware). Voz, público, autoridade
 *                   por nicho, com fallback editorial e override via notes.
 *
 *    visual.ts      Sistema visual: image specs, art direction blocks
 *                   (em inglês para os geradores), negative prompts em camadas.
 *
 *    inputs.ts      Interfaces de input de cada prompt.
 *
 *    text/          Prompts de texto, agrupados por papel:
 *      editorialFlow.ts  brainstorm, select-topic, outline, write-article.
 *      refinement.ts     review, optimize-seo, adapt-tone, inject-ctas.
 *      meta.ts           generate-metadata (title, desc, slug, excerpt).
 *      audit.ts          analyze-site, generate-category, generate-tags.
 *
 *    image/         Prompts de imagem:
 *      briefing.ts       post → briefing visual (em pt-BR).
 *      cover.ts          briefing → prompt 16:9 (capa do post).
 *      og.ts             briefing → prompt 1.91:1 (OpenGraph).
 *      thumbnail.ts      briefing → prompt 1:1 (social).
 *      internal.ts       briefing → prompt 3:2 (apoio interno).
 *      variations.ts     briefing → N variações com mesma identidade.
 *
 *  Esse arquivo agrega tudo via `prompts` registry e expõe `inspectAllPrompts`
 *  pro endpoint `/api/v1/prompts` e a página /configuracoes/prompts no admin.
 *
 *  Quando adicionar novo prompt:
 *    1. Adicione interface em `inputs.ts`.
 *    2. (Se há output estruturado) adicione Zod schema em `../schemas.ts`.
 *    3. Crie o PromptDef no módulo correspondente.
 *    4. Registre em `prompts` abaixo.
 *    5. (Opcional, recomendado) adicione sample em `SAMPLE_INPUTS`.
 *    6. Crie a skill em `../skills/` chamando `provider.generateStructured`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─── REGISTRY ──────────────────────────────────────────────────────────────

import {
  brainstormTopicsPrompt,
  outlineArticlePrompt,
  selectTopicPrompt,
  writeArticlePrompt,
} from './text/editorialFlow.js';
import {
  adaptTonePrompt,
  injectCtasPrompt,
  optimizeSeoPrompt,
  reviewArticlePrompt,
} from './text/refinement.js';
import { generateMetadataPrompt } from './text/meta.js';
import {
  analyzeSitePrompt,
  generateCategoryPrompt,
  generateTagsPrompt,
} from './text/audit.js';
import { imageBriefingPrompt } from './image/briefing.js';
import { coverImagePrompt } from './image/cover.js';
import { ogImagePrompt } from './image/og.js';
import { thumbnailImagePrompt } from './image/thumbnail.js';
import { internalImagePrompt } from './image/internal.js';
import { imageVariationsPrompt } from './image/variations.js';

import type { PromptDef, PromptCategory } from './types.js';

export const prompts = {
  // editorial flow
  brainstormTopics: brainstormTopicsPrompt,
  selectTopic: selectTopicPrompt,
  outlineArticle: outlineArticlePrompt,
  writeArticle: writeArticlePrompt,
  // refinement
  reviewArticle: reviewArticlePrompt,
  optimizeSeo: optimizeSeoPrompt,
  adaptTone: adaptTonePrompt,
  injectCtas: injectCtasPrompt,
  // meta
  generateMetadata: generateMetadataPrompt,
  // audit/taxonomy
  analyzeSite: analyzeSitePrompt,
  generateCategory: generateCategoryPrompt,
  generateTags: generateTagsPrompt,
  // visual
  imageBriefing: imageBriefingPrompt,
  coverImage: coverImagePrompt,
  ogImage: ogImagePrompt,
  thumbnailImage: thumbnailImagePrompt,
  internalImage: internalImagePrompt,
  imageVariations: imageVariationsPrompt,
} as const;

export type PromptName = keyof typeof prompts;

// ─── RE-EXPORTS ────────────────────────────────────────────────────────────

export type { PromptDef, PromptCategory } from './types.js';
export type {
  AdaptToneInput,
  AnalyzeSitePromptInput,
  BrainstormTopicsInput,
  BrandContext,
  BuildImagePromptInput,
  GenerateCategoryInput,
  GenerateMetadataInput,
  GenerateTagsInput,
  ImageBriefingInput,
  ImageVariationInput,
  InjectCtasInput,
  OptimizeSeoInput,
  OutlineArticleInput,
  ReviewArticleInput,
  SelectTopicInput,
  WriteArticleInput,
} from './inputs.js';

export { buildBrandProfile } from './brand.js';
export type { BrandProfile, BrandInputs } from './brand.js';

export {
  IMAGE_SPECS,
  negativeFor,
  PHOTO_BASE,
  PHOTO_BRAND_DEFAULT,
  PHOTO_TECHNICAL,
  COMPOSITION_BY_USAGE,
  NEGATIVE_BASE,
  NEGATIVE_EDITORIAL,
  NEGATIVE_SOCIAL,
} from './visual.js';
export type { ImageSpec, ImageUsage, ImageAspect } from './visual.js';

// ─── VISUALIZER ────────────────────────────────────────────────────────────

import { SAMPLE_INPUTS } from './samples.js';

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export interface PromptInspection {
  key: PromptName;
  name: string;
  category: PromptCategory;
  version: string;
  description: string;
  system: string;
  systemTokens: number;
  /** User message renderizado com sample sintético, só para visualização. */
  userSample: string;
  userSampleTokens: number;
  totalTokens: number;
}

/**
 * Renderiza todos os prompts em formato consumível pela UI/CLI.
 * NÃO chame em runtime de pipeline. Só pra inspeção.
 */
export function inspectAllPrompts(): PromptInspection[] {
  return (Object.keys(prompts) as PromptName[]).map((key) => {
    const p = prompts[key] as PromptDef<unknown>;
    const sample = SAMPLE_INPUTS[key];
    const userSample = p.user(sample);
    return {
      key,
      name: p.name,
      category: p.category,
      version: p.version,
      description: p.description,
      system: p.system,
      systemTokens: estimateTokens(p.system),
      userSample,
      userSampleTokens: estimateTokens(userSample),
      totalTokens: estimateTokens(p.system) + estimateTokens(userSample),
    };
  });
}
