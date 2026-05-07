/**
 * Schemas Zod das saídas estruturadas das skills.
 *
 * Cada skill tem 1 schema. O provider usa esse schema pra:
 *  - Claude: virar `input_schema` de uma tool forçada (`tool_choice`).
 *  - OpenAI: virar `response_format.json_schema.schema` com `strict: true`.
 *  - Mock: validar a saída mockada determinística.
 *
 * Tipos das skills são derivados via `z.infer<typeof schema>`. Sem duplicação
 * manual entre runtime e type. Um único arquivo, um padrão.
 *
 * Convenções para máxima compatibilidade com OpenAI strict mode:
 *  - Sem `.optional()` solto. Use `.nullable()` em campos opcionais.
 *  - Zod 4 com `target: 'openai'` força `additionalProperties: false`.
 *  - Enums via `z.enum([...])` viram `enum` no JSON Schema.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  POLÍTICA DE LIMITES
 * ─────────────────────────────────────────────────────────────────────────
 *  Limites APERTADOS são reservados para constraints técnicas reais:
 *    - SEO: metaTitle 70, metaDescription 180, slug 80.
 *    - Anchors curtas: ctaText, afterParagraphStart (precisam ser exatos).
 *    - Slugs e nomes que viram URL/identificador: 60-80 chars.
 *    - Enums: lista fechada de valores.
 *
 *  Limites GENEROSOS são default para texto descritivo gerado por LLM:
 *    - Razão/justificativa: 2000 chars (LLM tende a ser verboso).
 *    - Descrição/resumo: 1200 chars.
 *    - Item de lista descritiva: 500 chars.
 *    - Excerpt/summary editorial: 600 chars.
 *
 *  Filosofia: o JSON Schema sai mais permissivo, e qualquer truncamento
 *  cosmético acontece no skill via `.slice(maxVisual)`. Zod NUNCA deve
 *  rejeitar uma resposta legítima por excesso de caractere.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { z } from 'zod';

// Constantes de limite reusáveis. Quando precisar afrouxar, mude aqui.
const LIMIT = {
  // Hard (técnico)
  slug: 80,
  metaTitle: 70,
  metaDescriptionMin: 50,
  metaDescriptionMax: 180,
  tagSlug: 40,
  keywordTerm: 80,
  ctaText: 240,
  ctaAnchor: 240,
  // Soft (descritivo)
  shortLabel: 200, // workingTitle, h2, name
  shortDesc: 500, // angle, gapFilled, valueDelivered, mustInclude item
  mediumDesc: 1200, // reasoning, summary, description, palette block
  longDesc: 2000, // detail, problem+suggestion, change note
  faqAnswerHint: 800,
  hookText: 1000,
  contentExcerpt: 800,
  // Image
  imagePrompt: 2500,
  imageNegative: 1200,
  imageRationale: 800,
  altText: 240,
} as const;

// ─── Brainstorm topics ──────────────────────────────────────────────────────
export const topicCandidateSchema = z.object({
  workingTitle: z.string().min(3).max(LIMIT.shortLabel),
  angle: z.string().min(3).max(LIMIT.shortDesc),
  intent: z.enum(['informational', 'comparison', 'how-to', 'opinion', 'troubleshooting', 'review']),
  audienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  format: z.enum(['article', 'how-to', 'list', 'review', 'opinion']),
  primaryKeyword: z.string().min(2).max(LIMIT.keywordTerm * 2),
  secondaryKeywords: z.array(z.string().max(LIMIT.keywordTerm * 2)).max(8),
  gapFilled: z.string().max(LIMIT.shortDesc),
  valueDelivered: z.string().max(LIMIT.shortDesc),
});
export type TopicCandidate = z.infer<typeof topicCandidateSchema>;

export const brainstormTopicsSchema = z.object({
  candidates: z.array(topicCandidateSchema).min(1).max(12),
});
export type BrainstormTopicsOutput = z.infer<typeof brainstormTopicsSchema>;

// ─── Select topic ───────────────────────────────────────────────────────────
export const selectTopicSchema = z.object({
  selectedIndex: z.number().int().min(1).max(12),
  refinedTitle: z.string().min(3).max(LIMIT.shortLabel),
  reasoning: z.string().min(1).max(LIMIT.mediumDesc),
});
export type SelectTopicOutput = z.infer<typeof selectTopicSchema>;

// ─── Outline article ────────────────────────────────────────────────────────
export const outlineSectionSchema = z.object({
  h2: z.string().min(3).max(LIMIT.shortLabel),
  answerFirst: z.string().min(3).max(LIMIT.shortDesc),
  mustInclude: z.array(z.string().max(LIMIT.shortDesc)).max(10),
  h3s: z.array(z.string().max(LIMIT.shortLabel)).max(8).nullable(),
  useTable: z.boolean(),
  useNumberedList: z.boolean(),
});

export const outlineFaqSchema = z.object({
  question: z.string().min(3).max(LIMIT.shortDesc),
  answerHint: z.string().min(3).max(LIMIT.faqAnswerHint),
});

export const outlineArticleSchema = z.object({
  hook: z.string().min(3).max(LIMIT.hookText),
  sections: z.array(outlineSectionSchema).min(1).max(12),
  faq: z.array(outlineFaqSchema).max(10),
  // Faixa larga para acomodar de leituras curtas (~2min) a longas (~30min).
  wordCountTarget: z.number().int().min(300).max(6500),
});
export type OutlineArticleOutput = z.infer<typeof outlineArticleSchema>;

// ─── Write article ──────────────────────────────────────────────────────────
export const writeArticleSchema = z.object({
  /** Markdown completo do artigo. Sem max: artigo longo é legítimo. */
  content: z.string().min(200),
  /** Excerpt para preview. Generoso pra não rejeitar quando o modelo expande. */
  excerpt: z.string().min(20).max(LIMIT.contentExcerpt),
});
export type WriteArticleOutput = z.infer<typeof writeArticleSchema>;

// ─── Generate metadata (SEO duro: limites reais) ───────────────────────────
export const generateMetadataSchema = z.object({
  metaTitle: z.string().min(10).max(LIMIT.metaTitle),
  metaDescription: z.string().min(LIMIT.metaDescriptionMin).max(LIMIT.metaDescriptionMax),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(LIMIT.slug),
  keywords: z.array(z.string().max(LIMIT.keywordTerm)).max(12),
  suggestedTags: z.array(z.string().max(LIMIT.tagSlug)).max(8),
  summary: z.string().min(20).max(LIMIT.contentExcerpt),
});
export type GenerateMetadataOutput = z.infer<typeof generateMetadataSchema>;

// ─── Image prompt brief (LEGACY single-step, mantido pra compat) ───────────
export const imageBriefSchema = z.object({
  prompt: z.string().min(20).max(LIMIT.imagePrompt),
  negativePrompt: z.string().max(LIMIT.imageNegative),
  alt: z.string().min(10).max(LIMIT.altText),
  mood: z.string().max(LIMIT.shortLabel),
});
export type ImageBriefOutput = z.infer<typeof imageBriefSchema>;

// ─── Generate category ──────────────────────────────────────────────────────
export const generateCategorySchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(LIMIT.slug),
  name: z.string().min(2).max(LIMIT.shortLabel),
  description: z.string().max(LIMIT.mediumDesc).nullable(),
  reusedExisting: z.boolean(),
});
export type GenerateCategoryOutput = z.infer<typeof generateCategorySchema>;

// ─── Generate tags ──────────────────────────────────────────────────────────
export const generateTagsSchema = z.object({
  tags: z.array(z.string().min(2).max(LIMIT.tagSlug)).min(1).max(10),
});
export type GenerateTagsOutput = z.infer<typeof generateTagsSchema>;

// ─── Analyze site ───────────────────────────────────────────────────────────
export const siteInsightSchema = z.object({
  severity: z.enum(['high', 'medium', 'low']),
  area: z.enum(['content', 'structure', 'authority', 'opportunity']),
  title: z.string().min(3).max(LIMIT.shortLabel),
  detail: z.string().min(10).max(LIMIT.longDesc),
});

export const analyzeSiteSchema = z.object({
  insights: z.array(siteInsightSchema).max(12),
});
export type AnalyzeSiteOutput = z.infer<typeof analyzeSiteSchema>;

// ─── Review article ────────────────────────────────────────────────────────
export const reviewIssueSchema = z.object({
  severity: z.enum(['high', 'medium', 'low']),
  category: z.enum(['clarity', 'authority', 'flow', 'structure', 'tone', 'seo']),
  excerpt: z.string().min(3).max(LIMIT.shortDesc),
  problem: z.string().min(5).max(LIMIT.longDesc),
  suggestion: z.string().min(5).max(LIMIT.longDesc),
});

export const reviewArticleSchema = z.object({
  revisedContent: z.string().min(200),
  issues: z.array(reviewIssueSchema).max(25),
  summary: z.string().min(10).max(LIMIT.mediumDesc),
});
export type ReviewArticleOutput = z.infer<typeof reviewArticleSchema>;

// ─── Optimize SEO ──────────────────────────────────────────────────────────
export const optimizeSeoSchema = z.object({
  optimizedContent: z.string().min(200),
  changes: z.array(z.string().max(LIMIT.shortDesc)).max(20),
  primaryKeywordDensity: z.number().min(0).max(1),
});
export type OptimizeSeoOutput = z.infer<typeof optimizeSeoSchema>;

// ─── Adapt tone ────────────────────────────────────────────────────────────
export const adaptToneSchema = z.object({
  adaptedContent: z.string().min(200),
  changes: z.array(z.string().max(LIMIT.shortDesc)).max(20),
});
export type AdaptToneOutput = z.infer<typeof adaptToneSchema>;

// ─── Inject CTAs ───────────────────────────────────────────────────────────
export const ctaInsertionSchema = z.object({
  /** Âncora exata: pipeline procura essa string no markdown pra inserir o CTA. */
  afterParagraphStart: z.string().min(10).max(LIMIT.ctaAnchor),
  /** Texto do CTA. Frase única e curta. Aqui o limite curto é proposital. */
  ctaText: z.string().min(10).max(LIMIT.ctaText),
  url: z.string().url(),
});

export const injectCtasSchema = z.object({
  insertions: z.array(ctaInsertionSchema).min(1).max(4),
});
export type InjectCtasOutput = z.infer<typeof injectCtasSchema>;

// ─── Image briefing ────────────────────────────────────────────────────────
export const imageBriefingSchema = z.object({
  concept: z.string().min(10).max(LIMIT.shortDesc),
  subject: z.string().min(5).max(LIMIT.shortDesc),
  setting: z.string().min(5).max(LIMIT.shortDesc),
  mood: z.string().min(3).max(LIMIT.shortLabel),
  palette: z.string().min(5).max(LIMIT.shortDesc),
  keyDetails: z.array(z.string().max(LIMIT.shortDesc)).min(3).max(8),
  alt: z.string().min(40).max(LIMIT.altText),
});
export type ImageBriefingOutput = z.infer<typeof imageBriefingSchema>;

// ─── Build image prompt ────────────────────────────────────────────────────
export const buildImagePromptSchema = z.object({
  prompt: z.string().min(40).max(LIMIT.imagePrompt),
  negativePrompt: z.string().min(20).max(LIMIT.imageNegative),
  rationale: z.string().min(10).max(LIMIT.imageRationale),
});
export type BuildImagePromptOutput = z.infer<typeof buildImagePromptSchema>;

// ─── Image variations ──────────────────────────────────────────────────────
export const imageVariationSchema = z.object({
  angle: z.string().min(3).max(LIMIT.shortLabel),
  prompt: z.string().min(40).max(LIMIT.imagePrompt),
  changeNote: z.string().min(5).max(LIMIT.shortDesc),
});

export const imageVariationsSchema = z.object({
  variations: z.array(imageVariationSchema).min(1).max(8),
});
export type ImageVariationsOutput = z.infer<typeof imageVariationsSchema>;
