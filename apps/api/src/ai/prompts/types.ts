/**
 * Tipos da arquitetura de prompts.
 */

export type PromptCategory =
  | 'editorial' // brainstorm, select-topic, outline, write-article
  | 'refinement' // review, optimize-seo, adapt-tone, inject-ctas
  | 'meta' // metadata (title, description, slug, excerpt, keywords, tags)
  | 'audit' // analyze-site, generate-category, generate-tags
  | 'visual'; // briefing, cover, og, thumbnail, internal, variations

export interface PromptDef<I> {
  /** Slug curto. Vira `tool name` no provider. */
  name: string;
  /** Categoria pra agrupar no admin. */
  category: PromptCategory;
  /** Versão semver. Bumpe quando alterar `system`. */
  version: string;
  /** Descrição de 1 linha pra visualizador. */
  description: string;
  /** System prompt composto via building blocks. Cacheável quando ≥2k chars. */
  system: string;
  /** Builder do user message. */
  user: (input: I) => string;
}
