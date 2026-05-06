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
