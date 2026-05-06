import { prompts, type GenerateCategoryInput } from '../prompts/index.js';
import { getTextProvider } from '../providers/index.js';
import { parseJson, slugify } from './shared.js';

export interface GeneratedCategory {
  slug: string;
  name: string;
  description?: string;
  reusedExisting?: boolean;
}

export async function generateCategory(input: GenerateCategoryInput): Promise<GeneratedCategory> {
  const provider = await getTextProvider();
  const result = await provider.generateText({
    jsonMode: true,
    messages: [
      { role: 'system', content: prompts.generateCategory.system },
      { role: 'user', content: prompts.generateCategory.user(input) },
    ],
  });
  const data = parseJson<Partial<GeneratedCategory>>(result.text);
  const name = (data.name ?? 'Geral').toString();
  const slug = (data.slug && /^[a-z0-9-]+$/.test(data.slug) ? data.slug : slugify(name)).slice(0, 60);
  return {
    slug,
    name: name.slice(0, 80),
    description: data.description ? String(data.description).slice(0, 600) : undefined,
    reusedExisting: !!data.reusedExisting,
  };
}
