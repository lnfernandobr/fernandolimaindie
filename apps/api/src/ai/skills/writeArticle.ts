import { prompts, type WriteArticleInput } from '../prompts/index.js';
import { getTextProvider } from '../providers/index.js';
import { writeArticleSchema } from '../schemas.js';

export interface WrittenArticle {
  content: string;
  excerpt: string;
  provider: string;
}

export async function writeArticle(input: WriteArticleInput): Promise<WrittenArticle> {
  const provider = await getTextProvider();
  const { data, provider: providerName } = await provider.generateStructured({
    schemaName: 'WriteArticle',
    schemaDescription: 'Artigo completo em markdown + excerpt curto. content >= 200 chars.',
    schema: writeArticleSchema,
    messages: [
      { role: 'system', content: prompts.writeArticle.system },
      { role: 'user', content: prompts.writeArticle.user(input) },
    ],
    // Artigo pode ser longo — pedimos margem generosa.
    maxTokens: 8000,
  });

  return {
    content: data.content,
    excerpt: data.excerpt.slice(0, 400),
    provider: providerName,
  };
}
