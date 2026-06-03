import { INTENT_KEYS, LIMITS } from '../../constants/content.js';
import { GENERATION_ERRORS } from '../../constants/generation.js';
import { badRequest } from '../../errors/factories.js';

const TONE = [
  'Voce e um escritor devocional catolico em portugues brasileiro.',
  'Tom: acolhedor, contemplativo, simples, sem prosperidade, sem evangelico-show.',
  'Voce escreve como um padre de cidade pequena que conhece o povo.',
  'Sem clicheis ("abracos de luz", "vibracoes positivas"). Sem emojis. Sem travessao.',
  'Cite versiculos especificos quando relevante. Use voce, nao tu.',
].join(' ');

const COMMON_RULES = [
  `O campo answer responde a pergunta principal de quem chega, no maximo ${LIMITS.ANSWER_MAX} caracteres.`,
  `O campo summary tem 2 a 3 frases, no maximo ${LIMITS.SUMMARY_MAX} caracteres.`,
  'faq tem 2 a 4 perguntas que o publico realmente busca, com respostas curtas.',
  `relatedIntents traz 2 a 3 intents COMPLEMENTARES da lista: ${INTENT_KEYS.join(', ')}. Nunca inclua o intent principal.`,
];

const CHUNK_RULES = [
  `bodyHtml usa <p>, <strong>, <em> (sem <h1>/<h2>), no maximo ${LIMITS.BODY_MAX} caracteres.`,
  'chunks tem entre 2 e 5 itens. Cada id eh um slug kebab-case curto sem prefixo (ex: "abrigo", "respira", "entrega").',
  'Cada chunk html eh um trecho semantico autocontido com <p><strong>...</strong></p> seguido de <p>...</p>.',
];

const ARTICLE_RULES = [
  `bodyHtml eh um artigo de 4 a 6 secoes, cada uma com um subtitulo em <h2> seguido de <p>...</p>, no maximo ${LIMITS.BODY_MAX} caracteres.`,
  'chunks deve vir como lista vazia (o artigo vive no bodyHtml).',
];

const VERSE_RULES = [
  'verses traz de 6 a 10 versiculos sobre o tema, cada um com ref (ex: "Joao 3, 16") e text (a traducao de uso comum no Brasil).',
  `bodyHtml eh uma reflexao curta sobre o tema em 2 a 3 paragrafos <p>, no maximo ${LIMITS.BODY_MAX} caracteres.`,
  'chunks deve vir como lista vazia (a pagina mostra os versiculos e a reflexao).',
];

const rulesFor = (signalKind) => {
  if (signalKind === 'article') return ARTICLE_RULES;
  if (signalKind === 'verse_collection') return VERSE_RULES;
  return CHUNK_RULES;
};

const systemFor = (signalKind) =>
  `${TONE}\n\nRegras de formato (obrigatorias):\n- ${[...COMMON_RULES, ...rulesFor(signalKind)].join('\n- ')}`;

const ctx = ({ subject, intent }) => {
  const lines = [];
  if (subject.title) lines.push(`Titulo-alvo (use como base, pode refinar): "${subject.title}".`);
  if (subject.keyword) lines.push(`Palavra-chave de SEO: "${subject.keyword}".`);
  if (subject.brief) lines.push(`Resumo do que abordar: ${subject.brief}`);
  lines.push(`O publico chega com o intent "${intent}".`);
  return lines;
};

const psalmUser = (seed) => {
  const n = seed.subject.psalmNumber;
  return [
    n ? `Escreva o conteudo devocional sobre o Salmo ${n}.` : 'Escreva o conteudo devocional sobre este salmo.',
    ...ctx(seed),
    'Comece o bodyHtml citando o(s) primeiro(s) versiculo(s) do salmo em <p>.',
    'No primeiro chunk, ancore o tema central com uma imagem do salmo.',
  ].join('\n');
};

const prayerUser = (seed) => {
  const t = `${seed.subject.title ?? ''} ${seed.subject.keyword ?? ''}`;
  const isSaint = /\b(s[aã]o|santa|santo|nossa senhora|arcanjo|ave maria|pai nosso|credo)\b/i.test(t);
  return [
    'Escreva uma oracao devocional catolica.',
    ...ctx(seed),
    'bodyHtml deve incluir o TEXTO da oracao que a pessoa reza, entre <p>...</p>.',
    isSaint
      ? 'Inclua um chunk explicando quem foi o(a) santo(a)/devocao e quando se reza (festa, causas).'
      : 'Inclua um chunk com uma ancora pratica (ex: respiracao, gesto) e quando rezar.',
  ].join('\n');
};

const devotionalUser = (seed) =>
  [
    'Escreva um devocional curto e pratico.',
    ...ctx(seed),
    'Introduza um versiculo base, comente em 3-4 paragrafos e termine com um convite simples.',
    'Um chunk deve destacar o versiculo em <p><strong>versiculo</strong></p>.',
  ].join('\n');

const reflectionUser = (seed) =>
  [
    'Escreva uma reflexao meditativa e acolhedora.',
    ...ctx(seed),
    'Fale de forma honesta, sem moralismo, conectando fe e vida real.',
    'Use 2 a 3 chunks, cada um com uma ideia autocontida.',
  ].join('\n');

const articleUser = (seed) =>
  [
    'Escreva um artigo de blog longo, de ajuda pratica com base biblica, sem moralismo.',
    ...ctx(seed),
    'Estruture em 4 a 6 secoes com subtitulos <h2> no bodyHtml.',
    'Comece resolvendo a duvida principal nas primeiras linhas (answer-first).',
  ].join('\n');

const verseCollectionUser = (seed) => {
  const hints = Array.isArray(seed.subject.verseRefs) && seed.subject.verseRefs.length
    ? `Use preferencialmente estes versiculos (confira o texto): ${seed.subject.verseRefs.join('; ')}.`
    : 'Escolha de 6 a 10 versiculos conhecidos e fieis sobre o tema.';
  return [
    `Monte uma coletanea de versiculos sobre o tema "${seed.subject.tag ?? seed.subject.keyword ?? seed.intent}".`,
    ...ctx(seed),
    hints,
    'Preencha o campo verses (ref + text) e escreva uma reflexao curta no bodyHtml.',
  ].join('\n');
};

const USER_BUILDERS = Object.freeze({
  psalm: psalmUser,
  prayer: prayerUser,
  devotional: devotionalUser,
  reflection: reflectionUser,
  article: articleUser,
  'verse-collection': verseCollectionUser,
});

export const buildPrompt = (seed) => {
  const builder = USER_BUILDERS[seed.seedKind];
  if (!builder) throw badRequest(GENERATION_ERRORS.UNKNOWN_SEED_KIND);
  return { system: systemFor(seed.signalKind), user: builder(seed) };
};
