import { prompts, type GenerateCategoryInput } from '../prompts.js';
import { getTextProvider } from '../providers/index.js';
import { generateCategorySchema } from '../schemas.js';
import { slugify } from './shared.js';

export interface GeneratedCategory {
  slug: string;
  name: string;
  description?: string;
  reusedExisting?: boolean;
}

export async function generateCategory(input: GenerateCategoryInput): Promise<GeneratedCategory> {
  const provider = await getTextProvider();
  const { data } = await provider.generateStructured({
    schemaName: 'GenerateCategory',
    schemaDescription: 'Categoria do post — slug kebab-case, name, description e flag reusedExisting.',
    schema: generateCategorySchema,
    messages: [
      { role: 'system', content: prompts.generateCategory.system },
      { role: 'user', content: prompts.generateCategory.user(input) },
    ],
  });

  const safeSlug = /^[a-z0-9-]+$/.test(data.slug) ? data.slug : slugify(data.name);
  return {
    slug: safeSlug.slice(0, 60),
    name: data.name.slice(0, 80),
    description: data.description ? data.description.slice(0, 600) : undefined,
    reusedExisting: data.reusedExisting,
  };
}
