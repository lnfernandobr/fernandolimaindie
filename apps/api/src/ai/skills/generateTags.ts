import { prompts, type GenerateTagsInput } from '../prompts/index.js';
import { getTextProvider } from '../providers/index.js';
import { parseJson, slugify } from './shared.js';

export interface GeneratedTags {
  tags: string[];
}

export async function generateTags(input: GenerateTagsInput): Promise<GeneratedTags> {
  const provider = await getTextProvider();
  const result = await provider.generateText({
    jsonMode: true,
    messages: [
      { role: 'system', content: prompts.generateTags.system },
      { role: 'user', content: prompts.generateTags.user(input) },
    ],
  });
  const data = parseJson<Partial<GeneratedTags>>(result.text);
  const raw = Array.isArray(data.tags) ? data.tags : [];
  const cleaned = Array.from(
    new Set(
      raw
        .map((t) => slugify(String(t)))
        .filter((t) => t.length >= 2 && t.length <= 40),
    ),
  ).slice(0, 6);
  return { tags: cleaned };
}
