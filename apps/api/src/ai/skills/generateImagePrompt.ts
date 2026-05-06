import { prompts, type GenerateImagePromptInput } from '../prompts/index.js';
import { getTextProvider } from '../providers/index.js';
import { imageBriefSchema } from '../schemas.js';

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
  const { data, provider: providerName } = await provider.generateStructured({
    schemaName: 'ImageBrief',
    schemaDescription: 'Brief visual para gerar a capa do post: prompt, negativePrompt, alt, mood.',
    schema: imageBriefSchema,
    messages: [
      { role: 'system', content: prompts.generateImagePrompt.system },
      { role: 'user', content: prompts.generateImagePrompt.user(input) },
    ],
  });

  return {
    prompt: data.prompt.slice(0, 1000),
    negativePrompt: data.negativePrompt.slice(0, 400),
    alt: data.alt.slice(0, 200),
    mood: data.mood.slice(0, 60),
    provider: providerName,
  };
}
