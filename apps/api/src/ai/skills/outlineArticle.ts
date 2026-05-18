import { minutesToWordTarget } from '@fernandolimaindie/shared';
import { prompts, type OutlineArticleInput } from '../prompts/index.js';
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

  // Quando o canal pediu um alvo de leitura, esse valor MANDA. Ignoramos o que
  // a IA decidiu se passa de ±10%. O bug anterior aceitava ±20% e ainda assim
  // a IA na escrita driftava mais — resultando em posts de 14-15 min quando o
  // canal pedia 8. Agora trampamos no alvo exato sempre que extrapola o teto.
  let wordCountTarget = data.wordCountTarget;
  if (input.targetReadingMinutes) {
    const target = minutesToWordTarget(input.targetReadingMinutes);
    const max = Math.round(target * 1.1);
    if (data.wordCountTarget > max || data.wordCountTarget < target * 0.9) {
      wordCountTarget = target;
    }
  }

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
    wordCountTarget,
    provider: providerName,
  };
}
