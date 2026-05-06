import { prompts, type OutlineArticleInput } from '../prompts.js';
import { getTextProvider } from '../providers/index.js';
import { outlineArticleSchema } from '../schemas.js';

export interface ArticleOutline {
  hook: string;
  sections: {
    h2: string;
    answerFirst: string;
    mustInclude: string[];
    h3s?: string[];
    useTable?: boolean;
    useNumberedList?: boolean;
  }[];
  faq: { question: string; answerHint: string }[];
  wordCountTarget: number;
  provider: string;
}

export async function outlineArticle(input: OutlineArticleInput): Promise<ArticleOutline> {
  const provider = await getTextProvider();
  const { data, provider: providerName } = await provider.generateStructured({
    schemaName: 'OutlineArticle',
    schemaDescription: 'Outline editorial: hook + sections (h2 + answer-first + must-include) + faq + wordCountTarget.',
    schema: outlineArticleSchema,
    messages: [
      { role: 'system', content: prompts.outlineArticle.system },
      { role: 'user', content: prompts.outlineArticle.user(input) },
    ],
  });

  return {
    hook: data.hook,
    sections: data.sections.map((s) => ({
      h2: s.h2,
      answerFirst: s.answerFirst,
      mustInclude: s.mustInclude,
      h3s: s.h3s ?? undefined,
      useTable: s.useTable,
      useNumberedList: s.useNumberedList,
    })),
    faq: data.faq,
    wordCountTarget: data.wordCountTarget,
    provider: providerName,
  };
}
