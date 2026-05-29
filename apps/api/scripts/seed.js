import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { logger } from '../src/config/logger.js';
import { SignalModel } from '../src/modules/signals/signals.model.js';
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

const SIGNALS = [
  {
    slug: 'salmo-91',
    kind: 'psalm',
    intent: 'protection',
    topicSlug: 'protecao',
    entitySlugs: ['salmos'],
    title: 'Salmo 91 — o salmo da proteção',
    answer:
      'O Salmo 91 é a oração de quem se abriga em Deus como num esconderijo: "Aquele que habita no abrigo do Altíssimo descansa à sombra do Todo-Poderoso". Pode ser rezado de manhã, à noite ou em momentos de medo.',
    summary:
      'O Salmo 91 atravessa séculos como oração de proteção. Cobertura, refúgio, anjos. Reze devagar, uma frase de cada vez.',
    bodyHtml:
      '<p>Aquele que habita no abrigo do Altíssimo, e descansa à sombra do Todo-Poderoso, diz ao Senhor: "Meu refúgio e minha fortaleza, meu Deus, em quem confio."</p><p>Ele te livra do laço do caçador e da peste perniciosa. Ele te cobre com suas penas, e sob suas asas encontras refúgio. Sua fidelidade é escudo e armadura.</p><p>Não temerás os terrores da noite, nem a flecha que voa de dia, nem a peste que ronda nas trevas, nem o mal que devasta ao meio-dia. Mil cairão ao teu lado, dez mil à tua direita: tu não serás atingido.</p>',
    chunks: [
      {
        id: 'abrigo',
        html: '<p><strong>Aquele que habita no abrigo do Altíssimo, descansa à sombra do Todo-Poderoso.</strong></p><p>A imagem é de uma sombra protetora. Quando o dia é forte, você não combate o sol — você procura sombra. Salmo 91 chama essa sombra de morada.</p>',
      },
      {
        id: 'refugio',
        html: '<p><strong>Sob suas asas encontras refúgio.</strong></p><p>"Penas" e "asas" são imagem da galinha que protege os pintinhos. Jesus repete essa imagem em Mateus 23 quando chora por Jerusalém. É proximidade, não distância.</p>',
      },
      {
        id: 'noite',
        html: '<p><strong>Não temerás os terrores da noite.</strong></p><p>A noite assusta porque você não vê o que vem. O Salmo 91 não nega o terror — ele oferece outra companhia pra dentro dele.</p>',
      },
    ],
    faq: [
      {
        question: 'Quando rezar o Salmo 91?',
        answer:
          'De manhã ao acordar, à noite antes de dormir, ou em qualquer momento de medo. Não tem hora certa. Algumas famílias rezam toda noite pela casa.',
      },
      {
        question: 'Como rezar devagar?',
        answer:
          'Leia uma frase, respire, deixe a frase descer. Não tente cobrir o salmo inteiro de uma vez. Três versículos com calma valem mais que 16 corridos.',
      },
      {
        question: 'O Salmo 91 é só pra católicos?',
        answer:
          'Não. O Salmo 91 está na Bíblia hebraica e cristã. Católicos, evangélicos, ortodoxos e judeus rezam esse mesmo texto.',
      },
    ],
    relatedIntents: ['fear', 'sleep', 'night'],
  },
  {
    slug: 'oracao-para-ansiedade',
    kind: 'prayer',
    intent: 'anxiety',
    topicSlug: 'ansiedade',
    entitySlugs: ['jesus'],
    title: 'Oração para ansiedade — pra acalmar o coração agora',
    answer:
      'Quando a ansiedade aperta, respire devagar três vezes e reze: "Senhor, eu entrego o que não consigo carregar. Faz a tua paz descer no meu peito agora. Amém." Pode repetir.',
    summary:
      'Uma oração curta, prática, pra rezar quando o coração acelera. Sem teologia, sem performance — só ancoragem.',
    bodyHtml:
      '<p>Senhor, eu entrego o que não consigo carregar.</p><p>Faz a tua paz descer no meu peito agora — devagar, como respiração.</p><p>Lembra de mim que tu estás comigo. Que eu não tô sozinho. Que o que me assusta não tem palavra final.</p><p>Tira de mim o que não é meu. Devolve pra mim o que tu me deste: a calma, a confiança, o presente.</p><p>Em nome de Jesus, amém.</p>',
    chunks: [
      {
        id: 'respira',
        html: '<p><strong>Antes da oração, respira.</strong></p><p>Inspira pelo nariz contando 4. Segura 2. Solta pela boca contando 6. Faz isso 3 vezes. Só depois reze.</p>',
      },
      {
        id: 'entrega',
        html: '<p><strong>Entrega o que não é seu pra carregar.</strong></p><p>Filipenses 4 diz: "Não vivam ansiosos por nada, mas em tudo, pela oração e súplica com ação de graças, apresentem seus pedidos a Deus." Apresentar é diferente de resolver. Você apresenta. Deus carrega.</p>',
      },
    ],
    faq: [
      {
        question: 'A oração substitui terapia ou remédio?',
        answer:
          'Não. Oração é cuidado espiritual. Terapia e remédio são cuidado médico. Os dois andam juntos — um não anula o outro.',
      },
      {
        question: 'Posso rezar em silêncio?',
        answer: 'Pode. Em voz alta, em sussurro ou só no pensamento. Deus escuta os três.',
      },
    ],
    relatedIntents: ['fear', 'sleep'],
  },
  {
    slug: 'oracao-para-dormir-em-paz',
    kind: 'prayer',
    intent: 'sleep',
    topicSlug: 'sono',
    entitySlugs: [],
    title: 'Oração para dormir em paz — pra encerrar o dia',
    answer:
      'Antes de dormir, agradeça pelo dia, entregue o que te preocupa e peça uma noite tranquila: "Senhor, fica comigo essa noite. Cuida de quem amo. Me devolve descansado amanhã. Amém."',
    summary: 'Oração curta da noite. Agradecer, entregar, descansar. Três movimentos.',
    bodyHtml:
      '<p>Senhor, obrigado pelo dia que termina — pelo que foi bom e pelo que foi difícil.</p><p>Eu entrego nas tuas mãos o que ainda me preocupa. Tu cuidas enquanto eu durmo.</p><p>Cuida de quem eu amo: dos meus, dos próximos, dos que estão longe.</p><p>Me devolve amanhã descansado, com força pra continuar. Em nome de Jesus, amém.</p>',
    chunks: [
      {
        id: 'agradece',
        html: '<p><strong>Agradeça primeiro, peça depois.</strong></p><p>Mesmo num dia ruim, há o que agradecer: um corpo que respirou o dia inteiro, alguém que ligou, um café morno. Comece por aí.</p>',
      },
      {
        id: 'entrega',
        html: '<p><strong>Entregue o que não dorme.</strong></p><p>Aquela conversa que ficou pela metade, a conta de amanhã, o exame da semana que vem. Diga em voz alta: "isso aqui não é meu pra carregar agora." Deixa pra amanhã.</p>',
      },
    ],
    faq: [
      {
        question: 'Posso rezar deitado?',
        answer:
          'Pode. Muita gente reza essa oração já na cama, de luz apagada. Não tem postura errada — tem oração honesta.',
      },
    ],
    relatedIntents: ['night', 'gratitude'],
  },
  {
    slug: 'oracao-a-santo-judas-tadeu',
    kind: 'prayer',
    intent: 'hope',
    topicSlug: 'protecao',
    entitySlugs: ['judas-tadeu'],
    title: 'Oração a Santo Judas Tadeu — santo das causas difíceis',
    answer:
      'São Judas Tadeu é o santo das causas difíceis e impossíveis. A oração curta a ele pede intercessão quando tudo parece fechado: "São Judas Tadeu, intercede por mim nesta causa que parece impossível. Amém."',
    summary:
      'Apóstolo de Jesus, padroeiro das causas difíceis. Festa em 28 de outubro. Oração simples pra rezar todo dia ou no momento de aperto.',
    bodyHtml:
      '<p>Glorioso São Judas Tadeu, fiel servo e amigo de Jesus, intercede por mim que recorro a ti.</p><p>Em meio às causas difíceis e quase impossíveis, te peço que me alcances a graça que tanto desejo: <em>(dizer aqui a intenção)</em>.</p><p>Recorda-te do privilégio que recebeste do Senhor de socorrer particularmente nas situações sem solução humana.</p><p>São Judas Tadeu, rogai por nós. Amém.</p>',
    chunks: [
      {
        id: 'quem',
        html: '<p><strong>Quem foi São Judas Tadeu.</strong></p><p>Apóstolo de Jesus, irmão de Tiago, autor de uma das cartas do Novo Testamento. Por séculos foi pouco invocado por confusão de nome com Judas Iscariotes — o que explica a tradição de pedir a ele justamente as causas que parecem perdidas.</p>',
      },
      {
        id: 'quando',
        html: '<p><strong>Quando rezar.</strong></p><p>Tradicionalmente nas quintas-feiras (dia dedicado a ele) e no dia 28 de cada mês. Mas qualquer hora vale. Causa difícil não tem agenda.</p>',
      },
    ],
    faq: [
      {
        question: 'Preciso fazer novena pra ele atender?',
        answer:
          'Não. Novena é uma prática de 9 dias seguidos que ajuda a perseverar — não é exigência. Uma oração curta também é oração.',
      },
      {
        question: 'Posso pedir qualquer coisa?',
        answer:
          'Sim, mas o pedido deve ser por algo bom — saúde, paz, trabalho, reconciliação. A intercessão dos santos não é mágica: é amizade espiritual.',
      },
    ],
    relatedIntents: ['protection', 'faith'],
  },
  {
    slug: 'devocional-bom-dia',
    kind: 'devotional',
    intent: 'morning',
    topicSlug: 'gratidao',
    entitySlugs: [],
    title: 'Devocional de bom dia — começar com gratidão',
    answer:
      'Comece o dia agradecendo pela noite que passou e pedindo: "Senhor, abençoa esse dia. Cuida de mim e de quem cruza meu caminho. Amém." Três respirações lentas e siga.',
    summary: 'Cinco minutos pela manhã. Agradecer, abençoar o dia, sair pra vida.',
    bodyHtml:
      '<p>"De manhã ouvirás a minha voz; de manhã apresentarei a ti a minha oração" — Salmo 5:3.</p><p>Antes do celular, antes do café, três respirações lentas. Diga: "obrigado pelo dia que começa." Pronto. Já rezou.</p><p>Você pode continuar:</p><p>Senhor, abençoa esse dia. Abençoa quem vou encontrar. Me ajuda a ser presença boa pra alguém hoje. Cuida da minha família, dos meus amigos, de quem eu amo. Amém.</p>',
    chunks: [
      {
        id: 'antes-do-celular',
        html: '<p><strong>Antes do celular.</strong></p><p>Os primeiros 5 minutos do dia te entregam o tom das próximas 16 horas. Se a primeira voz que você ouve é a do feed, o dia já começa em reação. Se é a sua respiração e uma oração curta, o dia começa em escolha.</p>',
      },
      {
        id: 'abencoa',
        html: '<p><strong>Abençoar o dia.</strong></p><p>Abençoar não é proteger contra tudo — é entregar o dia pra Deus. Coisa boa vai acontecer. Coisa difícil também. Os dois entram na bênção.</p>',
      },
    ],
    faq: [
      {
        question: 'Quanto tempo dura?',
        answer:
          'De 2 a 5 minutos. Devocional não é estudo bíblico, é pausa curta. Se ficar longo demais, vira mais uma tarefa.',
      },
    ],
    relatedIntents: ['gratitude', 'faith'],
  },
  {
    slug: 'oracao-pela-familia',
    kind: 'prayer',
    intent: 'family',
    topicSlug: 'familia',
    entitySlugs: ['maria'],
    title: 'Oração pela família — pra rezar todo dia',
    answer:
      'Reze pela sua família lembrando cada pessoa: "Senhor, abençoa cada um da minha família. Cobre minha casa de paz. Em nome de Jesus, pelas mãos de Maria, amém."',
    summary:
      'Oração simples pra rezar de manhã ou à noite, lembrando cada membro da família pelo nome.',
    bodyHtml:
      '<p>Senhor, abençoa cada um da minha família. <em>(pode dizer os nomes, um por um)</em></p><p>Onde houver discussão, traz reconciliação. Onde houver cansaço, traz descanso. Onde houver distância, traz reaproximação.</p><p>Cobre minha casa de paz. Que ela seja abrigo, não campo de batalha.</p><p>Coloca a tua mão sobre cada um. Em nome de Jesus, pelas mãos de Maria, amém.</p>',
    chunks: [
      {
        id: 'nome-por-nome',
        html: '<p><strong>Reze pelo nome.</strong></p><p>"Abençoa a família" é genérico. "Abençoa o João, abençoa a Maria, abençoa o Pedro" é específico. Especificidade na oração é cuidado.</p>',
      },
      {
        id: 'casa',
        html: '<p><strong>Casa como abrigo.</strong></p><p>O Salmo 127 diz: "Se o Senhor não edifica a casa, em vão trabalham os que a edificam." Casa não é só parede — é o clima que tem dentro.</p>',
      },
    ],
    faq: [
      {
        question: 'E quando a família tá brigada?',
        answer:
          'Reze pelo nome de quem você não tá se falando. Não pra mudar o outro — pra abrir espaço em você. Reconciliação começa em quem reza primeiro.',
      },
    ],
    relatedIntents: ['gratitude', 'hope'],
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
    await upsertMany(SignalModel, SIGNALS, 'signals');
    logger.info('umsinaldefe seed complete');
  } finally {
    await disconnectDatabase();
  }
};

run().catch((err) => {
  logger.error({ err }, 'umsinaldefe seed failed');
  process.exitCode = 1;
});
