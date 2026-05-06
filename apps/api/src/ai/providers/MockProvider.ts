import type {
  AIProvider,
  GenerateImageInput,
  GenerateImageResult,
  GenerateStructuredInput,
  GenerateStructuredResult,
  GenerateTextInput,
  GenerateTextResult,
} from '../types.js';

/**
 * MockProvider — gera respostas procedurais determinísticas pra todas as
 * skills do pipeline, sem chamar API externa.
 *
 * `generateStructured` despacha por `schemaName` (preferido) — cada skill
 * tem um builder que retorna um objeto compatível com o Zod schema, validado
 * pelo próprio schema antes de devolver.
 *
 * `generateText` é mantido para chamadas livres (texto bruto, sem JSON).
 */
export class MockProvider implements AIProvider {
  readonly name = 'mock';
  readonly enabled = true;

  async generateText(input: GenerateTextInput): Promise<GenerateTextResult> {
    const userMsg = lastUserMsg(input.messages);
    return {
      provider: this.name,
      model: 'mock-text',
      text: userMsg.slice(0, 200),
    };
  }

  async generateStructured<T>(
    input: GenerateStructuredInput<T>,
  ): Promise<GenerateStructuredResult<T>> {
    const userMsg = lastUserMsg(input.messages);
    const builder = MOCK_BUILDERS[input.schemaName];
    const value = builder ? builder(userMsg) : {};

    // Valida com o próprio schema da skill — captura imediatamente quando
    // o mock está fora de sincronia com a definição do contrato.
    const data = input.schema.parse(value);

    return {
      data,
      provider: this.name,
      model: `mock-${input.schemaName.toLowerCase()}`,
    };
  }

  async generateImage(input: GenerateImageInput): Promise<GenerateImageResult> {
    const aspect = input.aspect ?? 'wide';
    const dims = aspect === 'square' ? [1200, 1200] : aspect === 'portrait' ? [900, 1600] : [1600, 900];
    const seed = encodeURIComponent(input.seed ?? input.prompt.slice(0, 40));
    return {
      provider: this.name,
      url: `https://picsum.photos/seed/${seed}/${dims[0]}/${dims[1]}`,
      alt: input.prompt.slice(0, 140),
      width: dims[0]!,
      height: dims[1]!,
    };
  }
}

// ─── Builders ──────────────────────────────────────────────────────────────

type Builder = (userMsg: string) => unknown;

const MOCK_BUILDERS: Record<string, Builder> = {
  BrainstormTopics: brainstormTopicsBuilder,
  SelectTopic: selectTopicBuilder,
  OutlineArticle: outlineArticleBuilder,
  WriteArticle: writeArticleBuilder,
  GenerateMetadata: generateMetadataBuilder,
  ImageBrief: imageBriefBuilder,
  GenerateCategory: generateCategoryBuilder,
  GenerateTags: generateTagsBuilder,
  AnalyzeSite: analyzeSiteBuilder,
};

function lastUserMsg(messages: { role: string; content: string }[]): string {
  return [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
}

function matchAfter(s: string, re: RegExp): string | undefined {
  return s.match(re)?.[1]?.trim();
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function nicheOf(userMsg: string): string {
  return matchAfter(userMsg, /Nicho:\s*(.+)/i) ?? 'geral';
}

const TOPICS_BY_NICHE: Record<string, string[]> = {
  sono: [
    'Higiene do sono em 7 hábitos com base científica',
    'Luz azul à noite: qual a real influência no ritmo circadiano',
    'Travesseiro certo para dormir de lado, costas e barriga',
    'Por que acordamos cansados mesmo com 8 horas dormidas',
    'Sono polifásico: o que a ciência mostra (e o que não)',
  ],
};
const FALLBACK_TOPICS = [
  'Erros comuns que iniciantes cometem',
  'Comparativo dos 5 equipamentos mais úteis',
  'Como começar bem em até 30 minutos por dia',
  'Mitos do nicho: o que a evidência mostra',
];

function brainstormTopicsBuilder(userMsg: string) {
  const niche = nicheOf(userMsg);
  const list = TOPICS_BY_NICHE[niche.toLowerCase()] ?? FALLBACK_TOPICS;
  const intents = ['informational', 'how-to', 'comparison', 'opinion', 'troubleshooting', 'review'] as const;
  const levels = ['beginner', 'intermediate', 'advanced'] as const;
  const formats = ['article', 'how-to', 'list', 'review', 'opinion'] as const;
  return {
    candidates: list.slice(0, 8).map((title, i) => ({
      workingTitle: title,
      angle: `Aborda ${title.toLowerCase()} sob ângulo prático com dados verificáveis e exemplos concretos.`,
      intent: intents[i % intents.length]!,
      audienceLevel: levels[i % levels.length]!,
      format: formats[i % formats.length]!,
      primaryKeyword: slugify(title).split('-').slice(0, 4).join(' '),
      secondaryKeywords: [niche, 'guia'].filter((s) => s.length > 1),
      gapFilled: `Não há post recente cobrindo este ângulo específico em ${niche}.`,
      valueDelivered: `Leitor termina sabendo aplicar uma decisão concreta sobre ${title.toLowerCase()}.`,
    })),
  };
}

function selectTopicBuilder(userMsg: string) {
  const titleMatch = /#1\.\s+(.+)/.exec(userMsg);
  const refined = (titleMatch?.[1] ?? 'Tema selecionado').trim();
  return {
    selectedIndex: 1,
    refinedTitle: refined.slice(0, 70),
    reasoning:
      'Cobre intenção how-to/comparison sem repetição com slugs recentes e oferece valor aplicável imediato.',
  };
}

function outlineArticleBuilder(userMsg: string) {
  const niche = nicheOf(userMsg);
  return {
    hook: `O detalhe que separa um resultado mediano de um excelente em ${niche} costuma ser ignorado por 90% dos iniciantes — e quase sempre é uma variável mensurável.`,
    sections: [
      {
        h2: 'Por que isso importa',
        answerFirst: 'A escolha errada nessa etapa compromete tudo que vem depois.',
        mustInclude: ['1 dado/estatística', 'exemplo concreto de erro comum', 'consequência mensurável'],
        h3s: null,
        useTable: false,
        useNumberedList: false,
      },
      {
        h2: 'Como avaliar na prática',
        answerFirst: 'Avalie por 3 critérios objetivos antes de decidir.',
        mustInclude: ['lista numerada', 'exemplo por critério'],
        h3s: null,
        useTable: false,
        useNumberedList: true,
      },
      {
        h2: 'Comparativo lado a lado',
        answerFirst: 'A diferença real aparece em 4 dimensões mensuráveis.',
        mustInclude: ['tabela comparativa', '2+ opções', 'critérios objetivos'],
        h3s: null,
        useTable: true,
        useNumberedList: false,
      },
      {
        h2: 'Erros mais comuns',
        answerFirst: 'Os 4 erros recorrentes que prejudicam o resultado.',
        mustInclude: ['cada erro com diagnóstico curto', 'correção concreta'],
        h3s: null,
        useTable: false,
        useNumberedList: false,
      },
      {
        h2: 'Próximos passos',
        answerFirst: 'O que fazer hoje pra aplicar tudo isso.',
        mustInclude: ['ação de curto prazo', 'sinal de progresso'],
        h3s: null,
        useTable: false,
        useNumberedList: false,
      },
    ],
    faq: [
      { question: 'Preciso de equipamento caro pra começar?', answerHint: 'Foco em essencial vs supérfluo' },
      { question: 'Qual o erro mais comum?', answerHint: 'Diagnóstico + correção' },
      { question: 'Quanto tempo até ver resultado?', answerHint: 'Janela realista 2-4 semanas' },
    ],
    wordCountTarget: 1100,
  };
}

function writeArticleBuilder(userMsg: string) {
  const niche = nicheOf(userMsg);
  const titleMatch = /Título:\s*#?\s*(.+)/i.exec(userMsg);
  const title = titleMatch?.[1]?.trim() ?? `Guia de ${niche}`;
  const content = `# ${title}

> Conteúdo gerado pelo provider mock. Em produção (claude/openai), o pipeline gera markdown editorial real seguindo o outline.

A diferença entre um resultado bom e medíocre em ${niche} costuma ser uma variável mensurável que iniciantes ignoram.

## Por que isso importa

A escolha errada na primeira etapa compromete tudo que vem depois. Um exemplo concreto: se você não calibra X corretamente, perde 30% do potencial — independente do equipamento.

## Como avaliar na prática

Avalie por 3 critérios objetivos:

1. **Consistência**: você repete o resultado em 5 tentativas seguidas?
2. **Sensibilidade**: pequenas mudanças geram diferença perceptível?
3. **Escalabilidade**: o que funciona pra você funciona em volumes diferentes?

## Comparativo lado a lado

| Opção | Custo | Curva | Resultado em 30 dias |
| ----- | ----- | ----- | -------------------- |
| Iniciante | Baixo | 1 semana | 60-70% do potencial |
| Intermediário | Médio | 2-3 semanas | 80-85% |
| Avançado | Alto | 1-2 meses | 90-95% |

## Erros mais comuns

- **Pular fundamentos**: técnica avançada sem básico dominado.
- **Equipamento como muleta**: comprar mais antes de saber usar.
- **Ignorar feedback**: não anotar o que funcionou e por quê.

## Próximos passos

Estabeleça baseline: repita seu processo atual 5 vezes e anote. Em uma semana, mude UMA variável.
`;
  return {
    content,
    excerpt: `Como diferenciar resultado bom de medíocre em ${niche} aplicando 3 critérios objetivos.`,
  };
}

function generateMetadataBuilder(userMsg: string) {
  const titleMatch = /Título atual:\s*(.+)/i.exec(userMsg);
  const title = (titleMatch?.[1] ?? 'Guia editorial').trim();
  const niche = nicheOf(userMsg);
  const slug = slugify(title);
  return {
    metaTitle: title.slice(0, 60),
    metaDescription: `${title}. Guia editorial com critérios e comparativo objetivo para decidir com base em dados.`.slice(
      0,
      160,
    ),
    slug,
    keywords: Array.from(
      new Set([niche, ...title.toLowerCase().split(/\s+/).filter((w) => w.length > 4)]),
    ).slice(0, 8),
    suggestedTags: Array.from(new Set([slugify(niche), 'guia', 'iniciante']))
      .filter((t) => t.length > 1)
      .slice(0, 5),
    summary: `${title} — visão prática com critérios objetivos para aplicar imediatamente.`,
  };
}

function imageBriefBuilder(userMsg: string) {
  const titleMatch = /Título do post:\s*(.+)/i.exec(userMsg);
  const title = (titleMatch?.[1] ?? 'editorial').trim();
  return {
    prompt: `Editorial photograph: hands using ${title} in natural daylight, on a wood surface, shallow depth of field, soft warm tones, 16:9, shot on 50mm lens, no text, no watermark.`,
    negativePrompt: 'text, watermark, logo, low quality, cartoon, illustration, 3d render, oversaturated',
    alt: `Foto editorial em luz natural mostrando o uso de ${title.toLowerCase()} em superfície de madeira clara.`,
    mood: 'calm, tactile, editorial',
  };
}

function generateCategoryBuilder(userMsg: string) {
  const niche = nicheOf(userMsg);
  return {
    slug: 'fundamentos',
    name: 'Fundamentos',
    description: `Conteúdo de fundamentos do nicho ${niche}.`,
    reusedExisting: false,
  };
}

function generateTagsBuilder(userMsg: string) {
  const niche = nicheOf(userMsg);
  const titleMatch = /Título:\s*(.+)/i.exec(userMsg);
  const fromTitle = (titleMatch?.[1] ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3)
    .slice(0, 4);
  const tags = Array.from(new Set([niche, ...fromTitle].filter(Boolean))).slice(0, 5);
  return { tags: tags.length > 0 ? tags : ['guia', 'iniciante'] };
}

function analyzeSiteBuilder(userMsg: string) {
  const niche = nicheOf(userMsg);
  return {
    insights: [
      {
        severity: 'high',
        area: 'authority',
        title: 'Bloco de autor sem credenciais visíveis',
        detail:
          'O autor não declara expertise verificável. E-E-A-T do Google e citação por LLMs valorizam isso fortemente.',
      },
      {
        severity: 'medium',
        area: 'content',
        title: `Profundidade média no nicho ${niche}`,
        detail:
          'Posts cobrem o básico mas não trazem dados originais. Conteúdo experiencial é a melhor defesa contra IA generalista citar concorrentes.',
      },
      {
        severity: 'medium',
        area: 'structure',
        title: 'Sem hub pages / cluster de conteúdo',
        detail:
          'Cada post vive isolado. Crie 2-3 páginas-pilar que linkam pra os posts e recebem links dos posts.',
      },
      {
        severity: 'low',
        area: 'opportunity',
        title: 'Oportunidade: comparativos lado a lado',
        detail: 'Conteúdo "X vs Y" tem alta intenção de compra e baixa concorrência genérica.',
      },
    ],
  };
}
