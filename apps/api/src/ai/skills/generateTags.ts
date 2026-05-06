import { prompts, type GenerateTagsInput } from '../prompts/index.js';
import { getTextProvider } from '../providers/index.js';
import { generateTagsSchema } from '../schemas.js';
import { slugify } from './shared.js';

export interface GeneratedTags {
  tags: string[];
}

export async function generateTags(input: GenerateTagsInput): Promise<GeneratedTags> {
  const provider = await getTextProvider();
  const { data } = await provider.generateStructured({
    schemaName: 'GenerateTags',
    schemaDescription: '3-6 tags para o post — slugs kebab-case, sem duplicadas, derivadas de tags existentes quando possível.',
    schema: generateTagsSchema,
    messages: [
      { role: 'system', content: prompts.generateTags.system },
      { role: 'user', content: prompts.generateTags.user(input) },
    ],
  });

  const cleaned = Array.from(
    new Set(data.tags.map((t) => slugify(t)).filter((t) => t.length >= 2 && t.length <= 40)),
  ).slice(0, 6);
  return { tags: cleaned };
}
