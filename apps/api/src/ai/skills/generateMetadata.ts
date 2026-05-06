import { prompts, type GenerateMetadataInput } from '../prompts.js';
import { getTextProvider } from '../providers/index.js';
import { generateMetadataSchema } from '../schemas.js';

export interface ArticleMetadata {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  keywords: string[];
  suggestedTags: string[];
  summary: string;
  provider: string;
}

export async function generateMetadata(input: GenerateMetadataInput): Promise<ArticleMetadata> {
  const provider = await getTextProvider();
  const { data, provider: providerName } = await provider.generateStructured({
    schemaName: 'GenerateMetadata',
    schemaDescription: 'Metadata SEO: metaTitle (<=70), metaDescription (<=180), slug, keywords, suggestedTags, summary.',
    schema: generateMetadataSchema,
    messages: [
      { role: 'system', content: prompts.generateMetadata.system },
      { role: 'user', content: prompts.generateMetadata.user(input) },
    ],
  });

  return {
    metaTitle: data.metaTitle.slice(0, 70),
    metaDescription: data.metaDescription.slice(0, 180),
    slug: data.slug.slice(0, 80),
    keywords: data.keywords.slice(0, 10),
    suggestedTags: data.suggestedTags.slice(0, 6),
    summary: data.summary.slice(0, 500),
    provider: providerName,
  };
}
