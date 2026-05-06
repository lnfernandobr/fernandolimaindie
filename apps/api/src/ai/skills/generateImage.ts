import { getImageProvider } from '../providers/index.js';

export interface GenerateImageInput {
  /** Prompt visual já refinado (vem da skill generateImagePromptBrief). */
  prompt: string;
  alt: string;
  /** Seed determinístico — útil em mock. */
  seed?: string;
}

export interface GeneratedImage {
  url: string;
  alt: string;
  width: number;
  height: number;
  provider: string;
}

/**
 * Converte um brief visual já elaborado em URL real de imagem.
 *
 * Diferente da versão antiga, essa skill NÃO chama mais o provider de texto
 * pra gerar o prompt — o brief vem pronto da skill `generateImagePromptBrief`,
 * que separa concerns: 1 prompt = 1 LLM call.
 */
export async function generateImage(input: GenerateImageInput): Promise<GeneratedImage> {
  const provider = await getImageProvider();
  const image = await provider.generateImage({
    prompt: input.prompt,
    aspect: 'wide',
    seed: input.seed ?? input.prompt.slice(0, 40),
  });
  return {
    url: image.url,
    alt: input.alt.slice(0, 200),
    width: image.width,
    height: image.height,
    provider: image.provider,
  };
}
