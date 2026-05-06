/**
 * Tipos compartilhados pela camada de IA.
 *
 * A interface aqui é intencionalmente mínima — qualquer provider novo
 * (Claude, OpenAI, Gemini) só precisa implementar `generateText`,
 * `generateStructured` e, opcionalmente, `generateImage`.
 *
 * Skills que retornam dados estruturados devem usar `generateStructured`:
 * passa um Zod schema, recebe dado tipado e validado, sem parse manual.
 * Evite `generateText` + parseJson — frágil quando o output cresce
 * (truncamento, escape de aspas, formato instável).
 */

import type { z } from 'zod';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GenerateTextInput {
  /** Mensagens no formato unificado (system/user/assistant). */
  messages: AIMessage[];
  /**
   * @deprecated Use `generateStructured` para output estruturado.
   * Mantido só para compat com chamadas que ainda esperam texto bruto.
   */
  jsonMode?: boolean;
  /** Override por chamada — útil pra usar Haiku em dev e Sonnet em prod. */
  model?: string;
  /** Limite de tokens; 0 ou undefined = padrão do provider. */
  maxTokens?: number;
  /** 0–1. Mais alto = mais criativo. */
  temperature?: number;
}

export interface GenerateTextResult {
  text: string;
  model: string;
  provider: string;
  isJson?: boolean;
}

export interface GenerateStructuredInput<T> {
  /** Mensagens no formato unificado (system/user/assistant). */
  messages: AIMessage[];
  /** Identificador curto da operação (vira nome da tool/json_schema). */
  schemaName: string;
  /** Descrição opcional — vira `tool.description` no Claude. */
  schemaDescription?: string;
  /** Zod schema do output esperado. Provider converte para JSON Schema. */
  schema: z.ZodType<T>;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GenerateStructuredResult<T> {
  /** Dado já tipado e validado pelo Zod. */
  data: T;
  model: string;
  provider: string;
}

export interface GenerateImageInput {
  prompt: string;
  /** "wide" para 16:9 (cover), "square" para galerias. */
  aspect?: 'wide' | 'square' | 'portrait';
  /** Seed determinístico — útil em mock. */
  seed?: string;
}

export interface GenerateImageResult {
  url: string;
  alt: string;
  width: number;
  height: number;
  provider: string;
}

export interface AIProvider {
  /** Identificador curto: "mock" | "claude" | "openai". */
  readonly name: string;
  /** Indica se o provider está habilitado/configurado. Falso = não usar. */
  readonly enabled: boolean;
  generateText(input: GenerateTextInput): Promise<GenerateTextResult>;
  generateStructured<T>(input: GenerateStructuredInput<T>): Promise<GenerateStructuredResult<T>>;
  generateImage(input: GenerateImageInput): Promise<GenerateImageResult>;
}
