import { INTENT_KEYS, LIMITS } from '../../constants/soulsignal.js';
import { GENERATION_ERRORS } from '../../constants/generation.js';
import { badRequest } from '../../errors/factories.js';

const TONE = [
  'Voce e um escritor devocional catolico em portugues brasileiro.',
  'Tom: acolhedor, contemplativo, simples, sem prosperidade, sem evangelico-show.',
  'Voce escreve como um padre de cidade pequena que conhece o povo.',
  'Sem clicheis ("abracos de luz", "vibracoes positivas"). Sem emojis.',
  'Cite versiculos especificos quando relevante. Use voce, nao tu.',
].join(' ');

const FORMAT_RULES = [
  `O campo answer tem no maximo ${LIMITS.ANSWER_MAX} caracteres e responde a pergunta principal de quem chega.`,
  `O campo summary tem 2 a 3 frases, no maximo ${LIMITS.SUMMARY_MAX} caracteres.`,
  `O campo bodyHtml usa <p>, <strong>, <em>, sem <h1>/<h2>, no maximo ${LIMITS.BODY_MAX} caracteres.`,
  `chunks tem entre 2 e 5 itens. Cada id eh um slug kebab-case curto sem prefixo (ex: "abrigo", "respira", "entrega").`,
  'Cada chunk html eh um trecho semantico autocontido com <p><strong>...</strong></p> seguido de <p>...</p>.',
  'faq tem 2 a 4 perguntas que o publico realmente busca.',
  `relatedIntents traz 2 a 3 intents COMPLEMENTARES da lista: ${INTENT_KEYS.join(', ')}.`,
  'Nunca inclua o intent principal nos relatedIntents.',
];

const SYSTEM_BASE = `${TONE}\n\nRegras de formato (obrigatorias):\n- ${FORMAT_RULES.join('\n- ')}`;

const psalmUser = ({ subject, intent }) => {
  const { psalmNumber, theme, hookWord } = subject;
  return [
    `Escreva o conteudo devocional sobre o Salmo ${psalmNumber}.`,
    `Tema central: ${theme}.`,
    `Palavra-chave de SEO: "${hookWord}".`,
    `O publico chega buscando o intent "${intent}".`,
    `title deve seguir formato: "Salmo ${psalmNumber} — {hook curto}".`,
    'Comece o bodyHtml com o primeiro versiculo do salmo entre <p>...</p>.',
    'No primeiro chunk, ancore o tema central com uma imagem do salmo.',
  ].join('\n');
};

const saintPrayerUser = ({ subject, intent }) => {
  const { saintName, saintTitle, feastDay, causes } = subject;
  return [
    `Escreva uma oracao a ${saintName} (${saintTitle}).`,
    `Festa: ${feastDay}. Causas que o povo confia a ele(a): ${causes.join(', ')}.`,
    `Intent: "${intent}".`,
    `title formato: "Oracao a ${saintName} — {hook curto}".`,
    'bodyHtml deve incluir UMA oracao curta entre aspas (o texto que a pessoa reza), em <p>.',
    'Um chunk deve explicar quando e como rezar essa oracao.',
  ].join('\n');
};

const intentPrayerUser = ({ subject, intent }) => {
  const { focus, situation } = subject;
  return [
    `Escreva uma oracao para o intent "${intent}".`,
    `Foco especifico: ${focus}.`,
    `Situacao do publico: ${situation}.`,
    `title formato: "Oracao para ${focus} — {hook acolhedor curto}".`,
    'bodyHtml deve incluir o texto da oracao em <p>, com 4 a 6 paragrafos.',
    'No primeiro chunk, ofereca uma ancora pratica (ex: respiracao, gesto) antes do texto.',
  ].join('\n');
};

const devotionalUser = ({ subject, intent }) => {
  const { theme, verseRef, dayMoment } = subject;
  return [
    `Escreva um devocional sobre "${theme}".`,
    `Versiculo base: ${verseRef}. Momento do dia: ${dayMoment}.`,
    `Intent: "${intent}".`,
    `title formato: "Devocional — {tema curto e direto}".`,
    'bodyHtml: introduca o versiculo, comente em 3-4 paragrafos, termine com convite simples.',
    'Um chunk com o versiculo destacado em <p><strong>versiculo</strong></p>.',
  ].join('\n');
};

const USER_BUILDERS = Object.freeze({
  psalm: psalmUser,
  'saint-prayer': saintPrayerUser,
  'intent-prayer': intentPrayerUser,
  devotional: devotionalUser,
});

export const buildPrompt = (seed) => {
  const builder = USER_BUILDERS[seed.seedKind];
  if (!builder) throw badRequest(GENERATION_ERRORS.UNKNOWN_SEED_KIND);
  return { system: SYSTEM_BASE, user: builder(seed) };
};
