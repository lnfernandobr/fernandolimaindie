/**
 * Inputs (interfaces) de cada prompt. Centralizados pra evitar import
 * cruzado entre módulos de texto e imagem.
 */

import type { TopicCandidate } from '../schemas.js';
import type { ImageUsage } from './visual.js';

// ─── BRAND ─────────────────────────────────────────────────────────────────

export interface BrandContext {
  channelName: string;
  niche: string;
  language?: string;
  /** Notes livres do admin com diretrizes de marca extras. */
  notes?: string;
}

// ─── TEXTO: FLUXO EDITORIAL ────────────────────────────────────────────────

export interface BrainstormTopicsInput extends BrandContext {
  /** Slugs dos últimos posts publicados. */
  recentSlugs?: string[];
  /** Categorias existentes pra balancear cobertura. */
  existingCategories?: { slug: string; name: string }[];
}

export interface SelectTopicInput extends BrandContext {
  candidates: TopicCandidate[];
  recentSlugs?: string[];
  recentFormats?: Record<string, number>;
}

export interface OutlineArticleInput extends BrandContext {
  refinedTitle: string;
  primaryKeyword: string;
  secondaryKeywords?: string[];
  intent: string;
  format: string;
  audienceLevel: string;
  /**
   * Alvo de tempo de leitura (em minutos). Quando presente, vira instrução
   * dura no prompt e overrides do wordCountTarget após a resposta da IA.
   */
  targetReadingMinutes?: number;
}

export interface WriteArticleInput extends BrandContext {
  refinedTitle: string;
  hook: string;
  sections: {
    h2: string;
    answerFirst: string;
    mustInclude: string[];
    h3s?: string[];
    useTable?: boolean;
    useNumberedList?: boolean;
  }[];
  faq: { question: string; answerHint: string }[];
  wordCountTarget: number;
  primaryKeyword: string;
  secondaryKeywords?: string[];
}

// ─── TEXTO: REFINAMENTO ────────────────────────────────────────────────────

export interface ReviewArticleInput extends BrandContext {
  refinedTitle: string;
  primaryKeyword: string;
  /** Conteúdo completo em markdown a ser revisado. */
  content: string;
  /** Foco da revisão. Sem indicação, faz revisão geral. */
  focus?: ('clarity' | 'authority' | 'flow' | 'structure' | 'anti-ai-tone')[];
}

export interface OptimizeSeoInput extends BrandContext {
  refinedTitle: string;
  primaryKeyword: string;
  secondaryKeywords?: string[];
  /** Conteúdo em markdown a ser otimizado. */
  content: string;
}

export interface AdaptToneInput extends BrandContext {
  /** Conteúdo em markdown a ser adaptado. */
  content: string;
  /** Override da voz padrão do canal. */
  toneOverride?: string;
}

export interface InjectCtasInput extends BrandContext {
  refinedTitle: string;
  /** Conteúdo em markdown que receberá CTAs. */
  content: string;
  /** Pontos disponíveis para linkar (ferramenta, post, newsletter). */
  ctaTargets: { label: string; url: string; valueHint: string }[];
  /** Quantidade-alvo de CTAs (default 2). */
  count?: number;
}

// ─── TEXTO: META ──────────────────────────────────────────────────────────

export interface GenerateMetadataInput extends BrandContext {
  title: string;
  content: string;
  excerpt?: string;
  primaryKeyword: string;
  secondaryKeywords?: string[];
}

// ─── TEXTO: AUDIT/TAXONOMIA ────────────────────────────────────────────────

export interface GenerateCategoryInput {
  niche: string;
  title: string;
  excerpt: string;
  existing: { slug: string; name: string }[];
}

export interface GenerateTagsInput {
  niche: string;
  title: string;
  excerpt: string;
  contentExcerpt?: string;
  existingTags?: string[];
}

export interface AnalyzeSitePromptInput {
  channelName: string;
  niche: string;
  siteUrl: string;
  htmlSample: string;
  technicalSummary: {
    performance: { score: number; loadTimeMs: number; htmlSizeKb: number };
    seo: {
      score: number;
      hasTitle: boolean;
      titleLength: number;
      hasMetaDescription: boolean;
      hasCanonical: boolean;
      hasOpenGraph: boolean;
      hasH1: boolean;
    };
    geo: {
      score: number;
      jsonLdCount: number;
      hasLlmsTxt: boolean;
      hasRssFeed: boolean;
      botsAllowed: boolean;
    };
    discovery: { hasRobotsTxt: boolean; hasSitemap: boolean };
  };
}

// ─── IMAGEM ───────────────────────────────────────────────────────────────

export interface ImageBriefingInput extends BrandContext {
  /** Título e resumo do post derivam o tema visual. */
  articleTitle: string;
  articleSummary: string;
  /** Conceito-chave do post (extraído do hook ou primeira seção). */
  concept?: string;
  /** Estilo visual do canal, se houver. Sem isso, usa o default da marca. */
  visualStyle?: string;
}

export interface BuildImagePromptInput extends BrandContext {
  /** Briefing visual produzido pelo step anterior. */
  briefing: {
    concept: string;
    subject: string;
    setting: string;
    mood: string;
    palette: string;
    keyDetails: string[];
  };
  /** Tipo de imagem, define composição e specs. */
  usage: ImageUsage;
  articleTitle: string;
}

export interface ImageVariationInput extends BuildImagePromptInput {
  /** Quantas variações gerar (cada uma com ângulo/composição diferente). */
  count: number;
  /** Variação anterior, pra não repetir o mesmo enquadramento. */
  previousAngles?: string[];
}
