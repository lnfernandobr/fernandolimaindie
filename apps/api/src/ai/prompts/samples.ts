/**
 * Inputs sintéticos para o visualizador (`inspectAllPrompts`).
 * Não usados em runtime, apenas para preview no admin.
 *
 * Quando adicionar prompt novo, adicione um sample aqui também
 * (caso contrário a UI mostra erro de "input ausente").
 */

import type { PromptName } from './index.js';

const SAMPLE_BRAND = {
  channelName: 'Sonoprofundo',
  niche: 'sono',
  language: 'pt-BR',
};

const SAMPLE_BRIEFING = {
  concept: 'Transição entre noite e amanhecer, momento em que o corpo decide despertar.',
  subject: 'Pessoa de costas, sentada na borda da cama, olhando para a janela.',
  setting: 'Quarto silencioso pré-amanhecer, lençóis de linho amassados, mesa de cabeceira com livro e copo de água.',
  mood: 'íntimo, contemplativo, levemente melancólico',
  palette: 'azuis profundos da noite, âmbar quente do nascer do sol, off-white dos lençóis',
  keyDetails: [
    'fio de luz dourada na borda do lençol',
    'livro aberto deitado sobre a mesa',
    'sombra longa do batente da janela no chão',
  ],
  alt: 'Pessoa sentada de costas na borda de uma cama olhando pela janela com luz dourada do amanhecer.',
};

const SAMPLE_ARTICLE_MD = `# Por que acordo às 3 da manhã todo dia

Acordar entre 2h e 4h não é "estresse" genérico. É um sinal específico do ciclo de cortisol.

## O que acontece às 3 da manhã

Esse horário é a transição entre fases do sono. Vulnerável a despertar quando há estímulo extra...
`;

const SAMPLE_INPUTS_MAP: { [K in PromptName]: unknown } = {
  brainstormTopics: {
    ...SAMPLE_BRAND,
    recentSlugs: ['higiene-do-sono-em-7-habitos', 'luz-azul-mito-ou-vilao'],
    existingCategories: [
      { slug: 'higiene-do-sono', name: 'Higiene do Sono' },
      { slug: 'ciencia-do-sono', name: 'Ciência do Sono' },
    ],
  },
  selectTopic: {
    ...SAMPLE_BRAND,
    candidates: [
      {
        workingTitle: 'Por que acordo às 3 da manhã todo dia',
        angle: 'Causas fisiológicas vs comportamentais do despertar precoce.',
        intent: 'troubleshooting',
        audienceLevel: 'beginner',
        format: 'article',
        primaryKeyword: 'acordar 3 da manhã',
        secondaryKeywords: ['insônia matinal'],
        gapFilled: 'Não há post cobrindo despertar específico de madrugada.',
        valueDelivered: 'Leitor identifica a causa provável e ajusta protocolo.',
      },
    ],
    recentSlugs: ['higiene-do-sono-em-7-habitos'],
    recentFormats: { article: 4, 'how-to': 2 },
  },
  outlineArticle: {
    ...SAMPLE_BRAND,
    refinedTitle: 'Por que acordo às 3 da manhã todo dia, e como parar',
    primaryKeyword: 'acordar 3 da manhã',
    secondaryKeywords: ['despertar precoce', 'insônia matinal'],
    intent: 'troubleshooting',
    format: 'article',
    audienceLevel: 'beginner',
  },
  writeArticle: {
    ...SAMPLE_BRAND,
    refinedTitle: 'Por que acordo às 3 da manhã todo dia, e como parar',
    hook: 'Acordar entre 2h e 4h não é estresse genérico. É sinal específico do ciclo de cortisol.',
    sections: [
      {
        h2: 'O que acontece às 3 da manhã',
        answerFirst: 'É a transição entre fases do sono, vulnerável a despertar quando há estímulo extra.',
        mustInclude: ['ciclo de cortisol', 'fase REM tardia', 'limiar de excitação'],
        useTable: false,
        useNumberedList: false,
      },
    ],
    faq: [{ question: 'Devo levantar ou ficar deitado?', answerHint: 'Regra dos 20 minutos' }],
    wordCountTarget: 1100,
    primaryKeyword: 'acordar 3 da manhã',
  },
  reviewArticle: {
    ...SAMPLE_BRAND,
    refinedTitle: 'Por que acordo às 3 da manhã todo dia',
    primaryKeyword: 'acordar 3 da manhã',
    content: SAMPLE_ARTICLE_MD,
    focus: ['clarity', 'authority'],
  },
  optimizeSeo: {
    ...SAMPLE_BRAND,
    refinedTitle: 'Por que acordo às 3 da manhã todo dia',
    primaryKeyword: 'acordar 3 da manhã',
    secondaryKeywords: ['despertar precoce'],
    content: SAMPLE_ARTICLE_MD,
  },
  adaptTone: {
    ...SAMPLE_BRAND,
    content: SAMPLE_ARTICLE_MD,
  },
  injectCtas: {
    ...SAMPLE_BRAND,
    refinedTitle: 'Por que acordo às 3 da manhã todo dia',
    content: SAMPLE_ARTICLE_MD,
    ctaTargets: [
      {
        label: 'Calculadora de ciclos de sono',
        url: 'https://sonoprofundo.com/#tool-title',
        valueHint: 'Mostra horários ideais de dormir/acordar com base em ciclos de 90 min.',
      },
    ],
    count: 2,
  },
  generateMetadata: {
    ...SAMPLE_BRAND,
    title: 'Por que acordo às 3 da manhã todo dia',
    content: SAMPLE_ARTICLE_MD,
    excerpt: 'Causas fisiológicas e comportamentais do despertar precoce.',
    primaryKeyword: 'acordar 3 da manhã',
  },
  analyzeSite: {
    channelName: 'Sonoprofundo',
    niche: 'sono',
    siteUrl: 'https://sonoprofundo.com',
    htmlSample: '<html><head><title>Sonoprofundo</title></head><body><h1>Hello</h1></body></html>',
    technicalSummary: {
      performance: { score: 92, loadTimeMs: 800, htmlSizeKb: 45 },
      seo: {
        score: 88,
        hasTitle: true,
        titleLength: 35,
        hasMetaDescription: true,
        hasCanonical: true,
        hasOpenGraph: true,
        hasH1: true,
      },
      geo: { score: 78, jsonLdCount: 3, hasLlmsTxt: true, hasRssFeed: true, botsAllowed: true },
      discovery: { hasRobotsTxt: true, hasSitemap: true },
    },
  },
  generateCategory: {
    niche: 'sono',
    title: 'Por que acordo às 3 da manhã',
    excerpt: 'Despertar precoce e protocolo de retorno ao sono.',
    existing: [
      { slug: 'higiene-do-sono', name: 'Higiene do Sono' },
      { slug: 'ciencia-do-sono', name: 'Ciência do Sono' },
    ],
  },
  generateTags: {
    niche: 'sono',
    title: 'Por que acordo às 3 da manhã',
    excerpt: 'Despertar precoce e como parar.',
    existingTags: ['higiene-do-sono', 'iniciante', 'ciencia'],
  },
  imageBriefing: {
    ...SAMPLE_BRAND,
    articleTitle: 'Por que acordo às 3 da manhã todo dia',
    articleSummary: 'Causas fisiológicas e comportamentais do despertar precoce.',
    concept: 'momento de vulnerabilidade entre noite e amanhecer',
  },
  coverImage: {
    ...SAMPLE_BRAND,
    briefing: SAMPLE_BRIEFING,
    usage: 'cover' as const,
    articleTitle: 'Por que acordo às 3 da manhã todo dia',
  },
  ogImage: {
    ...SAMPLE_BRAND,
    briefing: SAMPLE_BRIEFING,
    usage: 'og' as const,
    articleTitle: 'Por que acordo às 3 da manhã todo dia',
  },
  thumbnailImage: {
    ...SAMPLE_BRAND,
    briefing: SAMPLE_BRIEFING,
    usage: 'thumbnail' as const,
    articleTitle: 'Por que acordo às 3 da manhã todo dia',
  },
  internalImage: {
    ...SAMPLE_BRAND,
    briefing: SAMPLE_BRIEFING,
    usage: 'internal' as const,
    articleTitle: 'Por que acordo às 3 da manhã todo dia',
  },
  imageVariations: {
    ...SAMPLE_BRAND,
    briefing: SAMPLE_BRIEFING,
    usage: 'cover' as const,
    articleTitle: 'Por que acordo às 3 da manhã todo dia',
    count: 3,
    previousAngles: [],
  },
};

export const SAMPLE_INPUTS = SAMPLE_INPUTS_MAP;
