import { prompts, type GenerateImagePromptInput } from '../prompts/index.js';
import { getTextProvider } from '../providers/index.js';
import { parseJson } from './shared.js';

export interface ImageBrief {
  prompt: string;
  negativePrompt: string;
  alt: string;
  mood: string;
  provider: string;
}

export async function generateImagePromptBrief(
  input: GenerateImagePromptInput,
): Promise<ImageBrief> {
  const provider = await getTextProvider();
  const result = await provider.generateText({
    jsonMode: true,
    messages: [
      { role: 'system', content: prompts.generateImagePrompt.system },
      { role: 'user', content: prompts.generateImagePrompt.user(input) },
    ],
  });
  const data = parseJson<Partial<ImageBrief>>(result.text);

  return {
    prompt: String(data.prompt ?? '').slice(0, 1000),
    negativePrompt: String(data.negativePrompt ?? 'text, watermark, logo, low quality').slice(0, 400),
    alt: String(data.alt ?? `Imagem ilustrativa do post sobre ${input.articleTitle}.`).slice(0, 200),
    mood: String(data.mood ?? 'editorial').slice(0, 60),
    provider: result.provider,
  };
}
