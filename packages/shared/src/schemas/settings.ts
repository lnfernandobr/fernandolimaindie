import { z } from 'zod';

/**
 * Settings = singleton com a configuração de runtime da pipeline de IA.
 * Persistido em Mongo, editável pelo admin sem restart.
 *
 * Quando vazio (ainda não foi configurado pelo admin), a API cai pros valores
 * de env (`AI_PROVIDER`, `AI_MODEL`, `IMAGE_PROVIDER`, `IMAGE_MODEL`).
 */

export const aiProviderSchema = z.enum(['mock', 'claude', 'openai']);
export type AIProviderName = z.infer<typeof aiProviderSchema>;

export const imageProviderSchema = z.enum(['mock', 'openai']);
export type ImageProviderName = z.infer<typeof imageProviderSchema>;

/**
 * Modelos válidos por provider — fonte da verdade que o admin lê pra montar
 * o select. Adicionar/remover modelos aqui propaga automaticamente.
 *
 * `null` em aiModel/imageModel = "use o default do provider".
 */
export const AI_MODELS: Record<AIProviderName, string[]> = {
  mock: [],
  claude: ['claude-opus-4-7', 'claude-sonnet-4-6', 'claude-haiku-4-5'],
  openai: ['gpt-5', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4o', 'gpt-4o-mini'],
};

export const IMAGE_MODELS: Record<ImageProviderName, string[]> = {
  mock: [],
  openai: ['gpt-image-1', 'dall-e-3'],
};

export const settingsInputSchema = z
  .object({
    aiProvider: aiProviderSchema.default('mock'),
    aiModel: z.string().max(80).nullable().default(null),
    imageProvider: imageProviderSchema.default('mock'),
    imageModel: z.string().max(80).nullable().default(null),
  })
  .superRefine((value, ctx) => {
    const validText = AI_MODELS[value.aiProvider];
    if (
      value.aiProvider !== 'mock' &&
      value.aiModel &&
      validText.length > 0 &&
      !validText.includes(value.aiModel)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['aiModel'],
        message: `Modelo "${value.aiModel}" não é válido para o provider ${value.aiProvider}.`,
      });
    }
    const validImg = IMAGE_MODELS[value.imageProvider];
    if (
      value.imageProvider !== 'mock' &&
      value.imageModel &&
      validImg.length > 0 &&
      !validImg.includes(value.imageModel)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['imageModel'],
        message: `Modelo "${value.imageModel}" não é válido para o provider ${value.imageProvider}.`,
      });
    }
  });

export type SettingsInput = z.infer<typeof settingsInputSchema>;

export const settingsDtoSchema = z.object({
  aiProvider: aiProviderSchema,
  aiModel: z.string().nullable(),
  imageProvider: imageProviderSchema,
  imageModel: z.string().nullable(),
  updatedAt: z.string(),
  /**
   * `true` quando o provider foi reduzido para mock por falta de chave
   * (defesa contra config incompleta na API).
   */
  effectiveAiProvider: aiProviderSchema,
  effectiveImageProvider: imageProviderSchema,
});

export type SettingsDto = z.infer<typeof settingsDtoSchema>;
