import { prompts, type GenerateMetadataInput } from '../prompts/index.js';
import { getTextProvider } from '../providers/index.js';
import { parseJson, slugify } from './shared.js';

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
  const result = await provider.generateText({
    jsonMode: true,
    messages: [
      { role: 'system', content: prompts.generateMetadata.system },
      { role: 'user', content: prompts.generateMetadata.user(input) },
    ],
  });
  const data = parseJson<Partial<ArticleMetadata>>(result.text);

  const metaTitle = (data.metaTitle ?? input.title).toString().slice(0, 70);
  const metaDescription = (data.metaDescription ?? '').toString().slice(0, 180);
  const slug = (data.slug && /^[a-z0-9-]+$/.test(data.slug) ? data.slug : slugify(metaTitle)).slice(0, 80);
  const keywords = Array.isArray(data.keywords) ? data.keywords.map(String).slice(0, 10) : [];
  const suggestedTags = Array.isArray(data.suggestedTags)
    ? data.suggestedTags.map((t) => slugify(String(t))).filter(Boolean).slice(0, 6)
    : [];
  const summary = (data.summary ?? '').toString().slice(0, 500);

  return {
    metaTitle,
    metaDescription,
    slug,
    keywords,
    suggestedTags,
    summary,
    provider: result.provider,
  };
}
