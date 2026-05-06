import Anthropic from '@anthropic-ai/sdk';
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

const DEFAULT_MODEL = 'claude-sonnet-4-6';
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_TEMPERATURE = 0.7;

/**
 * Provider de texto via Anthropic Messages API.
 *
 * - `generateStructured` (recomendado): força o modelo a usar uma tool com
 *   `input_schema` derivado do Zod schema. A resposta vem como `tool_use`,
 *   garantindo JSON estruturado válido sem parse frágil. Funciona em todos
 *   os modelos da família 4.x, inclusive os com extended thinking que
 *   rejeitam assistant prefill.
 * - `generateText`: mantido para texto livre / chamadas legadas.
 * - System prompt vai com `cache_control: ephemeral` quando >= ~2k chars
 *   (regras editoriais + SEO/GEO). Reduz custo em ~90% em chamadas
 *   seguintes dentro de 5 min.
 * - Não suporta image — `generateImage` lança erro. Use OpenAIProvider.
 */
export class ClaudeProvider implements AIProvider {
  readonly name = 'claude';
  readonly enabled: boolean;
  readonly model: string;

  private client?: Anthropic;

  constructor(opts: { apiKey?: string; model?: string }) {
    this.enabled = Boolean(opts.apiKey);
    this.model = opts.model || DEFAULT_MODEL;
    if (this.enabled && opts.apiKey) {
      this.client = new Anthropic({ apiKey: opts.apiKey });
    }
  }

  async generateText(input: GenerateTextInput): Promise<GenerateTextResult> {
    if (!this.client) throw new Error('ClaudeProvider not configured (missing ANTHROPIC_API_KEY)');

    const { systemBlocks, messages } = this.partition(input.messages);
    const model = input.model || this.model;
    const response = await this.client.messages.create({
      model,
      max_tokens: input.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: input.temperature ?? DEFAULT_TEMPERATURE,
      system: systemBlocks,
      messages,
    });

    const block = response.content.find((c): c is Anthropic.TextBlock => c.type === 'text');
    return {
      provider: this.name,
      model,
      text: block?.text ?? '',
    };
  }

  async generateStructured<T>(
    input: GenerateStructuredInput<T>,
  ): Promise<GenerateStructuredResult<T>> {
    if (!this.client) throw new Error('ClaudeProvider not configured (missing ANTHROPIC_API_KEY)');

    const { systemBlocks, messages } = this.partition(input.messages);
    const inputSchema = z.toJSONSchema(input.schema, { target: 'draft-7' }) as Anthropic.Tool['input_schema'];

    const tool: Anthropic.Tool = {
      name: input.schemaName,
      description:
        input.schemaDescription ??
        `Submeta a resposta estruturada para ${input.schemaName}.`,
      input_schema: inputSchema,
    };

    const model = input.model || this.model;
    const response = await this.client.messages.create({
      model,
      max_tokens: input.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: input.temperature ?? DEFAULT_TEMPERATURE,
      system: systemBlocks,
      messages,
      tools: [tool],
      tool_choice: { type: 'tool', name: input.schemaName },
    });

    const toolUse = response.content.find(
      (c): c is Anthropic.ToolUseBlock => c.type === 'tool_use',
    );
    if (!toolUse || toolUse.name !== input.schemaName) {
      const stopReason = response.stop_reason;
      const text =
        response.content.find((c): c is Anthropic.TextBlock => c.type === 'text')?.text ?? '';
      throw new Error(
        `Claude não chamou a tool "${input.schemaName}" (stop_reason=${stopReason}). Texto: ${text.slice(0, 200)}`,
      );
    }

    // Validação Zod defensiva — em teoria a tool já garante structured input,
    // mas validamos pra capturar regressões e formatar erros legíveis.
    const parsed = input.schema.parse(toolUse.input);

    return {
      data: parsed,
      provider: this.name,
      model,
    };
  }

  async generateImage(_input: GenerateImageInput): Promise<GenerateImageResult> {
    throw new Error(
      'ClaudeProvider does not support image generation. Use OpenAIProvider for images.',
    );
  }

  /**
   * Separa system messages do resto e empacota como blocos com cache control
   * quando vale a pena (>=2k chars). Anthropic API espera `system` separado
   * de `messages`.
   */
  private partition(input: { role: string; content: string }[]): {
    systemBlocks: string | Anthropic.TextBlockParam[];
    messages: Anthropic.MessageParam[];
  } {
    const systemMsgs = input.filter((m) => m.role === 'system');
    const conversation = input.filter((m) => m.role !== 'system');
    const systemText = systemMsgs.map((m) => m.content).join('\n\n');
    const cacheable = systemText.length > 2000;
    const systemBlocks: string | Anthropic.TextBlockParam[] = cacheable
      ? [{ type: 'text', text: systemText, cache_control: { type: 'ephemeral' } }]
      : systemText;
    const messages: Anthropic.MessageParam[] = conversation.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));
    return { systemBlocks, messages };
  }
}
