import { prompts, type OutlineArticleInput } from '../prompts/index.js';
import { getTextProvider } from '../providers/index.js';
import { parseJson } from './shared.js';

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
  const result = await provider.generateText({
    jsonMode: true,
    messages: [
      { role: 'system', content: prompts.outlineArticle.system },
      { role: 'user', content: prompts.outlineArticle.user(input) },
    ],
  });
  const data = parseJson<Partial<ArticleOutline>>(result.text);

  if (!Array.isArray(data.sections) || data.sections.length === 0) {
    throw new Error('outlineArticle: no sections returned');
  }

  return {
    hook: String(data.hook ?? '').slice(0, 600),
    sections: data.sections
      .filter((s) => s.h2 && s.answerFirst)
      .map((s) => ({
        h2: String(s.h2),
        answerFirst: String(s.answerFirst),
        mustInclude: Array.isArray(s.mustInclude) ? s.mustInclude.map(String).slice(0, 8) : [],
        h3s: Array.isArray(s.h3s) ? s.h3s.map(String).slice(0, 6) : undefined,
        useTable: !!s.useTable,
        useNumberedList: !!s.useNumberedList,
      }))
      .slice(0, 8),
    faq: Array.isArray(data.faq)
      ? data.faq
          .filter((f): f is { question: string; answerHint: string } => Boolean(f?.question && f?.answerHint))
          .slice(0, 6)
      : [],
    wordCountTarget: clampWords(Number(data.wordCountTarget) || 1000),
    provider: result.provider,
  };
}

function clampWords(n: number): number {
  if (!Number.isFinite(n)) return 1000;
  return Math.max(600, Math.min(2500, Math.round(n)));
}
