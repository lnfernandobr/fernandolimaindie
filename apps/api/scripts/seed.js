import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { logger } from '../src/config/logger.js';
import { EntityModel } from '../src/modules/entities/entities.model.js';


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
