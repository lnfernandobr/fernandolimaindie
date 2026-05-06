import { prompts, type WriteArticleInput } from '../prompts/index.js';
import { getTextProvider } from '../providers/index.js';
import { parseJson } from './shared.js';

export interface WrittenArticle {
  content: string;
  excerpt: string;
  provider: string;
}

export async function writeArticle(input: WriteArticleInput): Promise<WrittenArticle> {
  const provider = await getTextProvider();
  const result = await provider.generateText({
    jsonMode: true,
    messages: [
      { role: 'system', content: prompts.writeArticle.system },
      { role: 'user', content: prompts.writeArticle.user(input) },
    ],
    // Artigo pode ser longo — pedimos margem ao provider real.
    maxTokens: 6000,
  });
  const data = parseJson<{ content?: string; excerpt?: string }>(result.text);
  if (!data.content || data.content.length < 200) {
    throw new Error('writeArticle: content too short or missing');
  }
  return {
    content: String(data.content),
    excerpt: String(data.excerpt ?? '').slice(0, 400) || data.content.slice(0, 240),
    provider: result.provider,
  };
}
