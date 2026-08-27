import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { logger } from '../src/config/logger.js';
import { TopicModel } from '../src/modules/topics/topics.model.js';
import { EntityModel } from '../src/modules/entities/entities.model.js';

const TOPICS = [
  {
    slug: 'fe',
    name: 'Fé',
    intent: 'faith',
    description: 'Salmos, orações e devocionais pra fortalecer a fé no dia a dia — na dúvida, na espera e na alegria.',
    answer: 'Fé não é ausência de dúvida — é confiar mesmo sem ver tudo. Salmos, orações curtas e devocionais ajudam a manter o coração firme quando a vida aperta.',
    bodyHtml: '<p>A fé se alimenta de prática: uma oração pela manhã, um salmo à noite, um momento de silêncio no meio do dia. Aqui você encontra textos curtos pra rezar e voltar a confiar.</p>',
  },
  {
    slug: 'cura',
    name: 'Cura',
    intent: 'healing',
    description: 'Orações e salmos de cura pro corpo, pra alma e pras feridas que ninguém vê.',
    answer: 'Pedir cura é entregar a Deus o que dói — no corpo e no coração. A oração caminha junto com o tratamento médico, nunca no lugar dele.',
    bodyHtml: '<p>Cura é processo. Salmos como o 41 e o 147, orações a Jesus e a entrega diária sustentam quem atravessa a doença — a própria ou a de quem ama.</p>',
  },
  {
    slug: 'protecao',
    name: 'Proteção',
    intent: 'protection',
    description: 'Salmos, orações e devocionais pra pedir proteção pra você, sua casa e quem você ama.',
    answer: 'A proteção espiritual passa por oração diária, salmos como o 91 e a fé de que Deus te cobre como sombra. Aqui você encontra preces curtas, antigas e novas, pra esses momentos.',
    bodyHtml: '<p>Em momentos de medo, ameaça ou cansaço, pedir proteção é um gesto simples — e antigo. Salmos como o 91, orações a São Miguel Arcanjo e o sinal da cruz acompanham gerações de famílias brasileiras.</p>',
  },
  {
    slug: 'ansiedade',
    name: 'Ansiedade',
    intent: 'anxiety',
    description: 'Orações curtas, salmos e respirações pra acalmar o coração quando a ansiedade aperta.',
    answer: 'Pra ansiedade, comece respirando devagar e diga uma oração curta — Filipenses 4, "Deus está comigo", um pai-nosso. A oração não cura sozinha, mas ancora você no agora.',
    bodyHtml: '<p>A ansiedade rouba o presente. Oração e respiração trazem você de volta. Você não precisa rezar bonito — só precisa rezar verdadeiro.</p>',
  },
  {
    slug: 'sono',
    name: 'Sono',
    intent: 'sleep',
    description: 'Orações da noite pra dormir em paz, agradecer pelo dia e entregar amanhã.',
    answer: 'Antes de dormir, respire fundo, agradeça pelo dia e entregue o que te preocupa. Uma oração curta — pai-nosso, salmo 4, "Senhor, fica comigo" — basta pra encerrar o dia em paz.',
    bodyHtml: '<p>A noite é hora de soltar. Não de resolver tudo, mas de entregar. Oração antes de dormir não é tarefa — é cuidado.</p>',
  },
  {
    slug: 'gratidao',
    name: 'Gratidão',
    intent: 'gratitude',
    description: 'Devocionais e orações de agradecimento pra começar e terminar o dia.',
    answer: 'Gratidão é a primeira oração. Dizer obrigado pelo dia, pela saúde, por quem te ama — antes de pedir qualquer coisa — muda como você atravessa o que vem depois.',
    bodyHtml: '<p>"Em tudo dai graças" (1 Tessalonicenses 5:18) não é ingenuidade — é prática. Agradecer no meio do difícil é o que separa fé de superstição.</p>',
  },
  {
    slug: 'familia',
    name: 'Família',
    intent: 'family',
    description: 'Orações pela família, pelos filhos, pelo casamento e pela casa.',
    answer: 'Rezar pela família é guardar quem você ama mesmo quando vocês estão longe. Uma oração curta pela manhã ou antes de dormir vale por horas de preocupação.',
    bodyHtml: '<p>Família se constrói no dia a dia — e na oração também. Pedir bênção pelos filhos, pelo casamento, pelos pais é uma prática que carrega gerações.</p>',
  },
];

const ENTITIES = [
  {
    slug: 'judas-tadeu',
    name: 'São Judas Tadeu',
    kind: 'saint',
    description: 'Apóstolo de Jesus, padroeiro das causas difíceis e impossíveis. Festa em 28 de outubro.',
    synonyms: ['Santo Judas', 'São Judas', 'Judas de Tiago', 'padroeiro das causas impossíveis'],
  },
  {
    slug: 'sao-miguel-arcanjo',
    name: 'São Miguel Arcanjo',
    kind: 'saint',
    description: 'Príncipe dos arcanjos, protetor contra o mal e patrono dos guerreiros espirituais.',
    synonyms: ['Miguel Arcanjo', 'Arcanjo Miguel', 'protetor contra o mal'],
  },
  {
    slug: 'nossa-senhora-aparecida',
    name: 'Nossa Senhora Aparecida',
    kind: 'saint',
    description: 'Padroeira do Brasil. Festa em 12 de outubro.',
    synonyms: ['Aparecida', 'Maria Aparecida', 'padroeira do Brasil'],
  },
  {
    slug: 'salmos',
    name: 'Salmos',
    kind: 'bible_book',
    description: 'Livro de orações poéticas do Antigo Testamento, 150 cânticos atribuídos a Davi e outros autores.',
    synonyms: ['Livro dos Salmos', 'Saltério'],
  },
  {
    slug: 'jesus',
    name: 'Jesus Cristo',
    kind: 'person',
    description: 'Filho de Deus, centro da fé cristã.',
    synonyms: ['Cristo', 'Senhor Jesus', 'Nosso Senhor'],
  },
  {
    slug: 'maria',
    name: 'Maria, Mãe de Jesus',
    kind: 'person',
    description: 'Mãe de Jesus, modelo de fé e mãe da Igreja.',
    synonyms: ['Nossa Senhora', 'Mãe de Deus', 'Virgem Maria'],
  },
  {
    slug: 'sao-bento',
    name: 'São Bento',
    kind: 'saint',
    description: 'Patriarca dos monges do Ocidente, invocado como protetor contra o mal. Festa em 11 de julho.',
    synonyms: ['Bento de Núrsia', 'medalha de São Bento', 'protetor contra o mal'],
  },
  {
    slug: 'santo-expedito',
    name: 'Santo Expedito',
    kind: 'saint',
    description: 'Mártir invocado nas causas urgentes e justas. Festa em 19 de abril.',
    synonyms: ['São Expedito', 'santo das causas urgentes'],
  },
  {
    slug: 'sao-francisco',
    name: 'São Francisco de Assis',
    kind: 'saint',
    description: 'Fundador dos franciscanos, santo da paz, dos pobres e da criação. Festa em 4 de outubro.',
    synonyms: ['Francisco de Assis', 'irmão Francisco', 'santo da paz'],
  },
  {
    slug: 'santa-teresinha',
    name: 'Santa Teresinha do Menino Jesus',
    kind: 'saint',
    description: 'Doutora da Igreja, santa do pequeno caminho de confiança. Festa em 1 de outubro.',
    synonyms: ['Teresinha do Menino Jesus', 'Santa Teresinha das Rosas', 'pequena Teresa'],
  },
  {
    slug: 'nossa-senhora-das-gracas',
    name: 'Nossa Senhora das Graças',
    kind: 'saint',
    description: 'Virgem da Medalha Milagrosa, invocada por graças e proteção. Festa em 27 de novembro.',
    synonyms: ['Medalha Milagrosa', 'Virgem da Medalha', 'Nossa Senhora da Medalha Milagrosa'],
  },
  {
    slug: 'nossa-senhora-desatadora-dos-nos',
    name: 'Nossa Senhora Desatadora dos Nós',
    kind: 'saint',
    description: 'Devoção mariana que pede a Maria para desatar os nós e situações difíceis da vida. Festa em 28 de setembro.',
    synonyms: ['Maria que desata os nós', 'Desatadora dos Nós', 'Nossa Senhora dos Nós'],
  },
  {
    slug: 'espirito-santo',
    name: 'Espírito Santo',
    kind: 'concept',
    description: 'Terceira pessoa da Santíssima Trindade, dador de sabedoria, consolo e força.',
    synonyms: ['Paráclito', 'Consolador', 'Divino Espírito Santo'],
  },
  {
    slug: 'anjo-da-guarda',
    name: 'Santo Anjo da Guarda',
    kind: 'concept',
    description: 'Anjo que, segundo a tradição cristã, Deus designa para guardar cada pessoa. Festa em 2 de outubro.',
    synonyms: ['Santo Anjo', 'anjo da guarda', 'anjo do Senhor'],
  },
];


const upsertMany = async (Model, docs, label) => {
  const ops = docs.map((doc) => ({
    updateOne: {
      filter: { slug: doc.slug },
      update: { $set: doc },
      upsert: true,
    },
  }));
  const result = await Model.bulkWrite(ops);
  logger.info(
    {
      label,
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
      matched: result.matchedCount,
    },
    `seeded ${label}`,
  );
};

const run = async () => {
  await connectDatabase();
  try {
    await upsertMany(TopicModel, TOPICS, 'topics');
    await upsertMany(EntityModel, ENTITIES, 'entities');
    logger.info('umsinaldefe seed complete');
  } finally {
    await disconnectDatabase();
  }
};

run().catch((err) => {
  logger.error({ err }, 'umsinaldefe seed failed');
  process.exitCode = 1;
});
