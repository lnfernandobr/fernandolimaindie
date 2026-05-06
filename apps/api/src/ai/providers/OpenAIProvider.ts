import OpenAI from 'openai';
import { z } from 'zod';
import type {
  AIProvider,
  GenerateImageInput,
  GenerateImageResult,
  GenerateStructuredInput,
  GenerateStructuredResult,
  GenerateTextInput,
  GenerateTextResult,
} from '../types.js';
import { saveImageBuffer } from '../../services/uploads.js';

const DEFAULT_TEXT_MODEL = 'gpt-4.1-mini';
const DEFAULT_IMAGE_MODEL = 'gpt-image-1';
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_TEMPERATURE = 0.7;

/**
 * Provider de texto e imagem via OpenAI.
 *
 * - `generateStructured` (recomendado): usa Structured Outputs nativos via
 *   `response_format: { type: 'json_schema', json_schema: { ..., strict: true } }`.
 *   OpenAI garante que a resposta cumpre o JSON Schema. Convertemos o Zod
 *   schema com `target: 'openai'` (additionalProperties=false em todo objeto,
 *   campos opcionais viram `nullable: true` requeridos).
 * - `generateText`: chat completions livre (sem JSON forçado). Mantido para
 *   chamadas que só precisam de texto.
 * - `generateImage`: gpt-image-1 retorna b64_json. Decodificamos, salvamos
 *   em /uploads/ e devolvemos URL pública.
 */
export class OpenAIProvider implements AIProvider {
  readonly name = 'openai';
  readonly enabled: boolean;
  readonly textModel: string;
  readonly imageModel: string;

  private client?: OpenAI;

  constructor(opts: { apiKey?: string; textModel?: string; imageModel?: string }) {
    this.enabled = Boolean(opts.apiKey);
    this.textModel = opts.textModel || DEFAULT_TEXT_MODEL;
    this.imageModel = opts.imageModel || DEFAULT_IMAGE_MODEL;
    if (this.enabled && opts.apiKey) {
      this.client = new OpenAI({ apiKey: opts.apiKey });
    }
  }

  get model(): string {
    return this.textModel;
  }

  async generateText(input: GenerateTextInput): Promise<GenerateTextResult> {
    if (!this.client) throw new Error('OpenAIProvider not configured (missing OPENAI_API_KEY)');

    const messages = input.messages.map((m) => ({
      role: m.role as 'system' | 'user' | 'assistant',
      content: m.content,
    }));

    const model = input.model || this.textModel;
    const response = await this.client.chat.completions.create({
      model,
      messages,
      max_tokens: input.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: input.temperature ?? DEFAULT_TEMPERATURE,
    });

    const text = response.choices[0]?.message?.content ?? '';
    return {
      provider: this.name,
      model,
      text,
    };
  }

  async generateStructured<T>(
    input: GenerateStructuredInput<T>,
  ): Promise<GenerateStructuredResult<T>> {
    if (!this.client) throw new Error('OpenAIProvider not configured (missing OPENAI_API_KEY)');

    const messages = input.messages.map((m) => ({
      role: m.role as 'system' | 'user' | 'assistant',
      content: m.content,
    }));

    const jsonSchema = z.toJSONSchema(input.schema, { target: 'draft-7' });

    const model = input.model || this.textModel;
    const response = await this.client.chat.completions.create({
      model,
      messages,
      max_tokens: input.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: input.temperature ?? DEFAULT_TEMPERATURE,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: input.schemaName,
          schema: jsonSchema as Record<string, unknown>,
          strict: true,
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      const refusal = response.choices[0]?.message?.refusal;
      throw new Error(
        `OpenAI ${input.schemaName}: resposta vazia${refusal ? ` (refusal: ${refusal})` : ''}`,
      );
    }

    let raw: unknown;
    try {
      raw = JSON.parse(content);
    } catch (err) {
      throw new Error(
        `OpenAI ${input.schemaName}: JSON inválido apesar de structured output. ${(err as Error).message}`,
      );
    }

    return {
      data: input.schema.parse(raw),
      provider: this.name,
      model,
    };
  }

  async generateImage(input: GenerateImageInput): Promise<GenerateImageResult> {
    if (!this.client) throw new Error('OpenAIProvider not configured (missing OPENAI_API_KEY)');

    const aspect = input.aspect ?? 'wide';
    // gpt-image-1 aceita: 1024x1024, 1024x1536, 1536x1024
    const size: '1536x1024' | '1024x1024' | '1024x1536' =
      aspect === 'square' ? '1024x1024' : aspect === 'portrait' ? '1024x1536' : '1536x1024';

    const response = await this.client.images.generate({
      model: this.imageModel,
      prompt: input.prompt,
      size,
      n: 1,
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) throw new Error('OpenAI image API returned no b64_json');

    const buffer = Buffer.from(b64, 'base64');
    const { publicUrl } = await saveImageBuffer(buffer, 'png');

    const [w, h] = size.split('x').map(Number) as [number, number];
    return {
      provider: this.name,
      url: publicUrl,
      alt: input.prompt.slice(0, 140),
      width: w,
      height: h,
    };
  }
}
