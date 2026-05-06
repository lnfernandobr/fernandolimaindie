/**
 * Schemas Zod das saídas estruturadas das skills.
 *
 * Cada skill tem 1 schema. O provider usa esse schema pra:
 *  - Claude: virar `input_schema` de uma tool forçada (`tool_choice`).
 *  - OpenAI: virar `response_format.json_schema.schema` com `strict: true`.
 *  - Mock: validar a saída mockada determinística.
 *
 * Tipos das skills são derivados via `z.infer<typeof schema>` — não há
 * duplicação manual entre runtime e type. Um único arquivo, um padrão.
 *
 * Convenções para máxima compatibilidade com OpenAI strict mode:
 *  - Sem `.optional()` solto — usar `.nullable()` em campos opcionais.
 *  - Sem `additionalProperties: true` — Zod 4 com `target: 'openai'` força
 *    `additionalProperties: false` em todos os objetos.
 *  - Enums via `z.enum([...])` — viram `enum` no JSON Schema.
 */

import { z } from 'zod';

// ─── Brainstorm topics ──────────────────────────────────────────────────────
// O prompt de brainstorm pede esses campos exatos — a tool/json_schema
// força o modelo a entregar tudo. selectTopic consome o mesmo shape.
export const topicCandidateSchema = z.object({
  workingTitle: z.string().min(3).max(160),
  angle: z.string().min(3).max(280),
  intent: z.enum(['informational', 'comparison', 'how-to', 'opinion', 'troubleshooting', 'review']),
  audienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  format: z.enum(['article', 'how-to', 'list', 'review', 'opinion']),
  primaryKeyword: z.string().min(2).max(80),
  secondaryKeywords: z.array(z.string().max(60)).max(6),
  gapFilled: z.string().max(280),
  valueDelivered: z.string().max(280),
});
export type TopicCandidate = z.infer<typeof topicCandidateSchema>;

export const brainstormTopicsSchema = z.object({
  candidates: z.array(topicCandidateSchema).min(1).max(12),
});
export type BrainstormTopicsOutput = z.infer<typeof brainstormTopicsSchema>;

// ─── Select topic ───────────────────────────────────────────────────────────
export const selectTopicSchema = z.object({
  selectedIndex: z.number().int().min(1).max(12),
  refinedTitle: z.string().min(3).max(160),
  reasoning: z.string().min(1).max(400),
});
export type SelectTopicOutput = z.infer<typeof selectTopicSchema>;

// ─── Outline article ────────────────────────────────────────────────────────
export const outlineSectionSchema = z.object({
  h2: z.string().min(3).max(140),
  answerFirst: z.string().min(3).max(400),
  mustInclude: z.array(z.string().max(200)).max(8),
  h3s: z.array(z.string().max(140)).max(6).nullable(),
  useTable: z.boolean(),
  useNumberedList: z.boolean(),
});

export const outlineFaqSchema = z.object({
  question: z.string().min(3).max(200),
  answerHint: z.string().min(3).max(400),
});

export const outlineArticleSchema = z.object({
  hook: z.string().min(3).max(600),
  sections: z.array(outlineSectionSchema).min(1).max(8),
  faq: z.array(outlineFaqSchema).max(6),
  wordCountTarget: z.number().int().min(400).max(3500),
});
export type OutlineArticleOutput = z.infer<typeof outlineArticleSchema>;

// ─── Write article ──────────────────────────────────────────────────────────
export const writeArticleSchema = z.object({
  content: z.string().min(200),
  excerpt: z.string().min(20).max(400),
});
export type WriteArticleOutput = z.infer<typeof writeArticleSchema>;

// ─── Generate metadata ──────────────────────────────────────────────────────
export const generateMetadataSchema = z.object({
  metaTitle: z.string().min(10).max(70),
  metaDescription: z.string().min(50).max(180),
  slug: z.string().regex(/^[a-z0-9-]+$/).max(80),
  keywords: z.array(z.string().max(60)).max(10),
  suggestedTags: z.array(z.string().max(40)).max(6),
  summary: z.string().min(20).max(500),
});
export type GenerateMetadataOutput = z.infer<typeof generateMetadataSchema>;

// ─── Image prompt brief ─────────────────────────────────────────────────────
export const imageBriefSchema = z.object({
  prompt: z.string().min(20).max(1000),
  negativePrompt: z.string().max(400),
  alt: z.string().min(10).max(200),
  mood: z.string().max(60),
});
export type ImageBriefOutput = z.infer<typeof imageBriefSchema>;

// ─── Generate category ──────────────────────────────────────────────────────
export const generateCategorySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).max(60),
  name: z.string().min(2).max(80),
  description: z.string().max(600).nullable(),
  reusedExisting: z.boolean(),
});
export type GenerateCategoryOutput = z.infer<typeof generateCategorySchema>;

// ─── Generate tags ──────────────────────────────────────────────────────────
export const generateTagsSchema = z.object({
  tags: z.array(z.string().min(2).max(40)).min(1).max(8),
});
export type GenerateTagsOutput = z.infer<typeof generateTagsSchema>;

// ─── Analyze site ───────────────────────────────────────────────────────────
export const siteInsightSchema = z.object({
  severity: z.enum(['high', 'medium', 'low']),
  area: z.enum(['content', 'structure', 'authority', 'opportunity']),
  title: z.string().min(3).max(120),
  detail: z.string().min(10).max(600),
});

export const analyzeSiteSchema = z.object({
  insights: z.array(siteInsightSchema).max(10),
});
export type AnalyzeSiteOutput = z.infer<typeof analyzeSiteSchema>;

// ─── Review article (passe de revisão editorial) ───────────────────────────
export const reviewIssueSchema = z.object({
  severity: z.enum(['high', 'medium', 'low']),
  category: z.enum(['clarity', 'authority', 'flow', 'structure', 'tone', 'seo']),
  excerpt: z.string().min(3).max(280),
  problem: z.string().min(5).max(300),
  suggestion: z.string().min(5).max(400),
});

export const reviewArticleSchema = z.object({
  /** Conteúdo final revisado em markdown. */
  revisedContent: z.string().min(200),
  /** Lista de issues encontradas e como foram resolvidas. */
  issues: z.array(reviewIssueSchema).max(20),
  /** Resumo das mudanças principais. */
  summary: z.string().min(10).max(400),
});
export type ReviewArticleOutput = z.infer<typeof reviewArticleSchema>;

// ─── Optimize SEO (passe focado em SEO) ────────────────────────────────────
export const optimizeSeoSchema = z.object({
  /** Conteúdo otimizado em markdown. Mesmo conteúdo essencial, melhor SEO. */
  optimizedContent: z.string().min(200),
  /** Mudanças aplicadas (resumo curto). */
  changes: z.array(z.string().max(280)).max(15),
  /** Densidade da palavra-chave principal estimada (0-1). Alvo 0.005-0.015. */
  primaryKeywordDensity: z.number().min(0).max(1),
});
export type OptimizeSeoOutput = z.infer<typeof optimizeSeoSchema>;

// ─── Adapt tone (alinhar voz com a marca) ──────────────────────────────────
export const adaptToneSchema = z.object({
  adaptedContent: z.string().min(200),
  changes: z.array(z.string().max(280)).max(15),
});
export type AdaptToneOutput = z.infer<typeof adaptToneSchema>;

// ─── Inject CTAs (CTAs naturais no meio do artigo) ─────────────────────────
export const ctaInsertionSchema = z.object({
  /** Texto exato que precede a inserção (âncora pra o pipeline localizar). */
  afterParagraphStart: z.string().min(10).max(200),
  /** Texto do CTA. Frase única, ação concreta. */
  ctaText: z.string().min(10).max(200),
  /** URL alvo (precisa estar em ctaTargets do input). */
  url: z.string().url(),
});

export const injectCtasSchema = z.object({
  insertions: z.array(ctaInsertionSchema).min(1).max(3),
});
export type InjectCtasOutput = z.infer<typeof injectCtasSchema>;

// ─── Image briefing (post → conceito visual) ───────────────────────────────
export const imageBriefingSchema = z.object({
  /** Conceito visual em uma frase. */
  concept: z.string().min(10).max(200),
  /** Sujeito principal (o que aparece na foto). */
  subject: z.string().min(5).max(200),
  /** Ambiente (onde acontece a cena). */
  setting: z.string().min(5).max(200),
  /** Atmosfera/sensação. */
  mood: z.string().min(3).max(80),
  /** Paleta de cores principal. */
  palette: z.string().min(5).max(200),
  /** 3 a 6 detalhes-chave que reforçam o conceito. */
  keyDetails: z.array(z.string().max(120)).min(3).max(6),
  /** Alt-text em pt-BR para acessibilidade (80-140 chars). */
  alt: z.string().min(40).max(180),
});
export type ImageBriefingOutput = z.infer<typeof imageBriefingSchema>;

// ─── Build image prompt (briefing → prompt em inglês para gerador) ─────────
export const buildImagePromptSchema = z.object({
  /** Prompt completo em inglês para o gerador de imagem. */
  prompt: z.string().min(40).max(1500),
  /** Negative prompt (já compõe layers do visual.ts; modelo pode estender). */
  negativePrompt: z.string().min(20).max(800),
  /** Razão: por que essa composição funciona pro tipo de uso. */
  rationale: z.string().min(10).max(400),
});
export type BuildImagePromptOutput = z.infer<typeof buildImagePromptSchema>;

// ─── Image variations (N variações do mesmo briefing) ──────────────────────
export const imageVariationSchema = z.object({
  /** Identificador curto da variação (ex: "wide-angle-morning"). */
  angle: z.string().min(3).max(80),
  /** Prompt completo em inglês. */
  prompt: z.string().min(40).max(1500),
  /** O que muda nessa variação versus o briefing base. */
  changeNote: z.string().min(5).max(300),
});

export const imageVariationsSchema = z.object({
  variations: z.array(imageVariationSchema).min(1).max(6),
});
export type ImageVariationsOutput = z.infer<typeof imageVariationsSchema>;
