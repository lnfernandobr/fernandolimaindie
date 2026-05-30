/**
 * Static content corpus for Um Sinal de Fé.
 *
 * The site used to read every page from an external content API (MongoDB-backed).
 * That API is not deployed/seeded, so content pages returned 404s and empty hubs.
 * This module is the single source of truth instead: it exposes the same data
 * shapes the pages already expect (see lib/content/types.js), served locally
 * through lib/content/api.js. No page or component needs to change.
 *
 * Editorial rules for everything in here:
 *   - Brazilian Portuguese, warm and plain, like a person talking to a friend.
 *   - No em-dash (travessão). Use commas, periods, parentheses or colons.
 *   - Answer-first: the `answer` field resolves the search intent in 1 to 3 lines.
 */

const PUB = '2026-05-01T08:00:00.000Z';
const UPD = '2026-05-20T08:00:00.000Z';

/** chunk helper */
const c = (id, html) => ({ id, html });

/** normalize an authored signal into the full signalSchema shape */
const mk = (s) => ({
  id: s.slug,
  slug: s.slug,
  kind: s.kind,
  intent: s.intent,
  topicSlug: s.topicSlug,
  entitySlugs: [],
  title: s.title,
  answer: s.answer,
  summary: s.summary,
  bodyHtml: s.bodyHtml || '',
  chunks: s.chunks || [],
  faq: s.faq || [],
  relatedIntents: s.relatedIntents || [],
  audioUrl: s.audioUrl || null,
  imageUrl: s.imageUrl || null,
  lang: 'pt-BR',
  status: 'published',
  publishedAt: s.publishedAt || PUB,
  updatedAt: s.updatedAt || UPD,
});

/* ------------------------------------------------------------------ */
/* SALMOS                                                              */
/* ------------------------------------------------------------------ */

const PSALMS = [
  {
    slug: 'salmo-91',
    kind: 'psalm',
    intent: 'protection',
    topicSlug: 'salmos-de-protecao',
    relatedIntents: ['fear', 'night', 'faith'],
    title: 'Salmo 91: o salmo da proteção (texto e como rezar)',
    answer:
      'O Salmo 91 é a oração de quem se abriga em Deus como num esconderijo. Ele abre com a frase "Aquele que habita no abrigo do Altíssimo descansa à sombra do Todo-Poderoso". Dá pra rezar de manhã, à noite ou em qualquer momento de medo.',
    summary:
      'Um salmo de refúgio e confiança. Fala de uma sombra que protege, de anjos que guardam o caminho e de uma presença que não abandona, mesmo na noite mais pesada.',
    chunks: [
      c(
        'texto',
        `<h2>O texto do Salmo 91</h2>
        <p class="scripture">Aquele que habita no abrigo do Altíssimo descansa à sombra do Todo-Poderoso. Digo ao Senhor: meu refúgio e minha fortaleza, meu Deus, em quem confio.</p>
        <p class="scripture">Ele te livra do laço do caçador e da peste perigosa. Com suas penas ele te cobre, e sob suas asas encontras refúgio. A fidelidade dele é teu escudo e tua defesa.</p>
        <p class="scripture">Não temerás os terrores da noite, nem a flecha que voa de dia. Porque aos seus anjos ele ordenou que te guardem em todos os teus caminhos.</p>`,
      ),
      c(
        'significado',
        `<h2>O que o Salmo 91 quer dizer</h2>
        <p>A imagem central é a de uma sombra. Quando o dia está forte, ninguém enfrenta o sol de peito aberto, a gente procura uma sombra pra descansar. O salmo chama Deus de sombra, de abrigo, de esconderijo. Não é fuga do mundo, é um lugar firme pra ficar de pé dentro dele.</p>
        <p>As "asas" lembram a galinha que junta os pintinhos debaixo dela quando vem o perigo. É uma imagem de proximidade, não de distância. Jesus usa essa mesma figura em Mateus 23, quando chora por Jerusalém.</p>`,
      ),
      c(
        'como-rezar',
        `<h2>Como rezar o Salmo 91 devagar</h2>
        <p>Reze uma frase de cada vez. Leia, respire, deixe a frase descer antes de passar pra próxima. Três versículos com calma valem mais que o salmo inteiro lido às pressas.</p>
        <ul>
          <li>De manhã, peça cobertura pro dia que começa.</li>
          <li>À noite, entregue o sono e as pessoas que você ama.</li>
          <li>No meio do medo, repita só a primeira frase até o coração desacelerar.</li>
        </ul>`,
      ),
    ],
    faq: [
      {
        question: 'Quando rezar o Salmo 91?',
        answer:
          'De manhã ao acordar, à noite antes de dormir, ou em qualquer momento de medo. Não tem hora certa. Muita gente reza toda noite pedindo proteção pela casa e pela família.',
      },
      {
        question: 'O Salmo 91 é só pra católicos?',
        answer:
          'Não. Ele está na Bíblia hebraica e na cristã. Católicos, evangélicos, ortodoxos e judeus rezam esse mesmo texto há séculos.',
      },
      {
        question: 'O que significam as "asas" do Salmo 91?',
        answer:
          'É a imagem da ave que protege os filhotes debaixo das penas. Fala de uma proteção próxima e carinhosa, não de algo frio ou distante.',
      },
    ],
  },
  {
    slug: 'salmo-23',
    kind: 'psalm',
    intent: 'faith',
    topicSlug: 'salmos-de-confianca',
    relatedIntents: ['anxiety', 'grief', 'hope'],
    title: 'Salmo 23: o Senhor é meu pastor (significado e oração)',
    answer:
      'O Salmo 23 é a oração da confiança em meio à falta. Começa com "O Senhor é o meu pastor, nada me faltará" e segue por verdes pastos, águas tranquilas e um vale escuro que não dá medo, porque alguém caminha junto.',
    summary:
      'O salmo do descanso e da provisão. Mostra Deus como pastor que conduz, alimenta e acompanha, inclusive na travessia mais difícil.',
    chunks: [
      c(
        'texto',
        `<h2>O texto do Salmo 23</h2>
        <p class="scripture">O Senhor é o meu pastor, nada me faltará. Ele me faz repousar em verdes pastos e me conduz a águas tranquilas. Ele restaura a minha alma.</p>
        <p class="scripture">Ainda que eu ande pelo vale da sombra da morte, não temerei mal nenhum, porque tu estás comigo. A tua vara e o teu cajado me consolam.</p>
        <p class="scripture">Preparas uma mesa diante de mim, e a bondade me seguirá todos os dias da minha vida.</p>`,
      ),
      c(
        'significado',
        `<h2>Por que esse salmo acalma tanto</h2>
        <p>Ele não promete uma vida sem vale escuro. Promete companhia dentro dele. A frase que vira a chave não é "não há vale", é "tu estás comigo". A confiança aqui não nega a dificuldade, ela coloca alguém ao lado de quem atravessa.</p>
        <p>A mesa preparada "diante dos adversários" é uma imagem de paz no meio da tensão. Dá pra sentar e comer mesmo quando nem tudo está resolvido.</p>`,
      ),
    ],
    faq: [
      {
        question: 'O que significa "nada me faltará"?',
        answer:
          'Não é promessa de riqueza. É a confiança de que o essencial, o cuidado de Deus, não vai faltar, mesmo quando outras coisas faltam.',
      },
      {
        question: 'Posso rezar o Salmo 23 num velório ou no luto?',
        answer:
          'Sim. É um dos salmos mais rezados em momentos de perda, justamente pela imagem do vale escuro atravessado em companhia.',
      },
      {
        question: 'Qual a melhor hora pra rezar o Salmo 23?',
        answer:
          'Em qualquer momento de cansaço ou aperto. Muita gente reza antes de dormir, pra entregar o dia e descansar a alma.',
      },
    ],
  },
  {
    slug: 'salmo-121',
    kind: 'psalm',
    intent: 'protection',
    topicSlug: 'salmos-de-protecao',
    relatedIntents: ['hope', 'morning', 'faith'],
    title: 'Salmo 121: o socorro vem do Senhor (salmo da viagem)',
    answer:
      'O Salmo 121 é a oração de quem levanta os olhos e pergunta de onde vem a ajuda. A resposta é direta: "O meu socorro vem do Senhor, que fez o céu e a terra". É o salmo de quem viaja e de quem fica esperando em casa.',
    summary:
      'Um salmo de guarda para o caminho. Repete que Deus não dorme, não cochila e guarda a entrada e a saída de quem confia nele.',
    chunks: [
      c(
        'texto',
        `<h2>O texto do Salmo 121</h2>
        <p class="scripture">Elevo os meus olhos para os montes: de onde me virá o socorro? O meu socorro vem do Senhor, que fez o céu e a terra.</p>
        <p class="scripture">Ele não permitirá que o teu pé vacile, aquele que te guarda não dormita. O Senhor é quem te guarda.</p>
        <p class="scripture">O Senhor te guardará de todo mal, ele guardará a tua vida. O Senhor guardará a tua saída e a tua entrada, desde agora e para sempre.</p>`,
      ),
      c(
        'significado',
        `<h2>O salmo de quem está na estrada</h2>
        <p>Esse salmo era cantado por peregrinos subindo a Jerusalém. Por isso ele combina tanto com viagem, mudança, começo de algo novo. A palavra que mais se repete é "guardar". Aparece seis vezes, como quem insiste num cuidado que não tira o olho de você.</p>
        <p>"Guardar a saída e a entrada" é uma forma de dizer: o dia inteiro, do primeiro ao último passo.</p>`,
      ),
    ],
    faq: [
      {
        question: 'O Salmo 121 é mesmo o salmo da viagem?',
        answer:
          'Sim. É tradicional rezar antes de pegar a estrada ou de uma mudança grande, pedindo guarda na saída e na chegada.',
      },
      {
        question: 'Posso rezar o Salmo 121 pelos meus filhos?',
        answer:
          'Pode. Muita gente reza por quem está longe ou na rua, trocando "tua saída" por "a saída dele" ou "dela".',
      },
      {
        question: 'O que quer dizer "ele não dormita"?',
        answer:
          'Que o cuidado de Deus não tira plantão. Mesmo quando você dorme, há um olhar acordado por você.',
      },
    ],
  },
  {
    slug: 'salmo-27',
    kind: 'psalm',
    intent: 'fear',
    topicSlug: 'salmos-de-confianca',
    relatedIntents: ['anxiety', 'hope', 'faith'],
    title: 'Salmo 27: o Senhor é minha luz, a quem temerei?',
    answer:
      'O Salmo 27 é a oração de quem sente medo e escolhe coragem assim mesmo. Ele começa com "O Senhor é a minha luz e a minha salvação, a quem temerei?" e termina pedindo um coração firme pra esperar.',
    summary:
      'Um salmo que devolve coragem sem fingir que a noite não existe. Fala de luz, de uma só coisa pedida a Deus e da espera que sustenta.',
    chunks: [
      c(
        'texto',
        `<h2>O texto do Salmo 27</h2>
        <p class="scripture">O Senhor é a minha luz e a minha salvação, a quem temerei? O Senhor é a fortaleza da minha vida, de quem terei medo?</p>
        <p class="scripture">Uma coisa peço ao Senhor e a buscarei: habitar na casa do Senhor todos os dias da minha vida.</p>
        <p class="scripture">Espera no Senhor, tem bom ânimo, e ele fortalecerá o teu coração. Espera, pois, no Senhor.</p>`,
      ),
      c(
        'significado',
        `<h2>Coragem que não nega o medo</h2>
        <p>Repare que o salmo não diz "não tenha medo porque nada de ruim vai acontecer". Ele diz "a quem temerei", colocando a luz na frente do escuro. A coragem aqui nasce da presença, não da ausência de ameaça.</p>
        <p>E ele termina com um conselho honesto pra quem está cansado: espera. Esperar também é um jeito de ter fé, mesmo quando a resposta demora.</p>`,
      ),
    ],
    faq: [
      {
        question: 'O Salmo 27 ajuda contra o medo e a ansiedade?',
        answer:
          'Ajuda a reposicionar o medo. Ele não promete fim do perigo, mas oferece luz e companhia pra atravessar, e pede um coração firme pra esperar.',
      },
      {
        question: 'Qual é a "uma coisa" que o salmo pede?',
        answer:
          'Habitar na casa do Senhor, ou seja, viver perto de Deus. É um pedido de proximidade acima de tudo.',
      },
      {
        question: 'Quando rezar o Salmo 27?',
        answer:
          'Em dias de insegurança, antes de uma decisão difícil, ou quando o medo aperta e você precisa de ânimo pra seguir.',
      },
    ],
  },
  {
    slug: 'salmo-51',
    kind: 'psalm',
    intent: 'forgiveness',
    topicSlug: 'perdao',
    relatedIntents: ['faith', 'healing', 'hope'],
    title: 'Salmo 51: cria em mim um coração puro (salmo do recomeço)',
    answer:
      'O Salmo 51 é a oração de quem reconhece o próprio erro e pede um novo começo. O pedido mais conhecido é "Cria em mim, ó Deus, um coração puro e renova em mim um espírito firme".',
    summary:
      'O salmo do arrependimento e da misericórdia. Fala sem rodeios da culpa, mas aposta tudo num Deus que limpa, recria e devolve a alegria.',
    chunks: [
      c(
        'texto',
        `<h2>O texto do Salmo 51</h2>
        <p class="scripture">Tem misericórdia de mim, ó Deus, segundo a tua bondade. Lava-me completamente da minha culpa e purifica-me do meu pecado.</p>
        <p class="scripture">Cria em mim, ó Deus, um coração puro e renova em mim um espírito firme. Não me afastes da tua presença.</p>
        <p class="scripture">Devolve-me a alegria da tua salvação e sustenta-me com um espírito generoso.</p>`,
      ),
      c(
        'significado',
        `<h2>Recomeçar é possível</h2>
        <p>A palavra "cria" é a mesma do início da Bíblia, quando Deus faz o mundo do nada. O salmo pede isso pra dentro da gente: não um conserto por cima, mas um coração novo. É a oração de quem está cansado de carregar o que ele mesmo botou nas costas.</p>
        <p>Não é um salmo de autopunição. Depois do reconhecimento vem o pedido de alegria de volta. Perdão, aqui, termina em leveza.</p>`,
      ),
    ],
    faq: [
      {
        question: 'O Salmo 51 serve pra pedir perdão?',
        answer:
          'Sim. É o salmo mais ligado ao arrependimento e ao recomeço. Ajuda a colocar em palavras o que pesa e a entregar isso a Deus.',
      },
      {
        question: 'Preciso me sentir muito culpado pra rezar esse salmo?',
        answer:
          'Não. Ele não é castigo. É um pedido sincero de coração novo, e termina pedindo a alegria de volta, não mais peso.',
      },
      {
        question: 'Dá pra rezar o Salmo 51 antes de uma confissão?',
        answer:
          'Dá, e muita gente faz isso. Ele prepara o coração pra reconhecer com verdade e receber a misericórdia.',
      },
    ],
  },
  {
    slug: 'salmo-139',
    kind: 'psalm',
    intent: 'faith',
    topicSlug: 'salmos-de-confianca',
    relatedIntents: ['anxiety', 'hope', 'gratitude'],
    title: 'Salmo 139: Senhor, tu me sondas e me conheces',
    answer:
      'O Salmo 139 é a oração de quem se sente conhecido por inteiro. Ele diz "Senhor, tu me sondas e me conheces" e lembra que não existe lugar, nem o mais escondido, onde Deus não esteja perto.',
    summary:
      'O salmo da intimidade. Fala de ser visto, conhecido e amado por dentro, e de uma presença que acompanha em qualquer canto, até no escuro.',
    chunks: [
      c(
        'texto',
        `<h2>O texto do Salmo 139</h2>
        <p class="scripture">Senhor, tu me sondas e me conheces. Sabes quando me sento e quando me levanto, de longe penetras meus pensamentos.</p>
        <p class="scripture">Para onde poderia ir longe do teu espírito? Se eu subir aos céus, lá estás. Se descer ao abismo, ali também estás.</p>
        <p class="scripture">Tu formaste o meu interior, tu me teceste no ventre da minha mãe. Maravilhosas são as tuas obras.</p>`,
      ),
      c(
        'significado',
        `<h2>Ser conhecido não assusta, acolhe</h2>
        <p>Tem gente que tem medo de ser visto por inteiro, com defeitos e tudo. Esse salmo vira a chave: ser conhecido por Deus é estar seguro, não exposto. Ele conhece e mesmo assim fica perto.</p>
        <p>A frase sobre ser "tecido no ventre" fala de valor desde o começo. Você não é um acaso. Foi pensado com cuidado.</p>`,
      ),
    ],
    faq: [
      {
        question: 'O Salmo 139 fala sobre a presença de Deus em todo lugar?',
        answer:
          'Sim. Ele diz que não há lugar, alto ou baixo, claro ou escuro, onde Deus não esteja. É um salmo de companhia constante.',
      },
      {
        question: 'Esse salmo ajuda quem se sente sozinho?',
        answer:
          'Muito. Ele lembra que você é conhecido e acompanhado mesmo quando ninguém por perto parece notar.',
      },
      {
        question: 'O que significa "tu me sondas"?',
        answer:
          'Que Deus conhece você por dentro, seus pensamentos e seus dias, e mesmo assim permanece próximo e cuidadoso.',
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* ORAÇÕES                                                             */
/* ------------------------------------------------------------------ */

const PRAYERS = [
  {
    slug: 'oracao-para-dormir-em-paz',
    kind: 'prayer',
    intent: 'sleep',
    topicSlug: 'oracoes-da-noite',
    relatedIntents: ['anxiety', 'night', 'protection'],
    title: 'Oração para dormir em paz',
    answer:
      'Uma oração curta pra rezar na cama, quando a cabeça não desliga. Você entrega o dia, pede cuidado por quem ama e descansa sabendo que não está sozinho na noite.',
    summary:
      'Uma oração simples pra fechar o dia, soltar o que ficou pendente e adormecer com o coração mais leve.',
    chunks: [
      c(
        'oracao',
        `<h2>A oração</h2>
        <p class="scripture">Senhor, fica comigo essa noite. Recebe o meu dia, o que deu certo e o que não deu. Cuida de quem eu amo, mesmo de quem está longe.</p>
        <p class="scripture">Tira do meu peito o que eu não consigo resolver agora. Eu durmo, tu ficas acordado. Me devolve descansado amanhã. Amém.</p>`,
      ),
      c(
        'como-usar',
        `<h2>Pra rezar com calma</h2>
        <p>Respire fundo antes de começar e leia bem devagar, como quem conversa baixinho. Se a ansiedade voltar no meio da noite, repita só a primeira frase: "Senhor, fica comigo". Não precisa rezar tudo de novo.</p>`,
      ),
    ],
    faq: [
      {
        question: 'Qual oração rezar pra conseguir dormir?',
        answer:
          'Uma oração curta de entrega, como esta, ajuda a desacelerar. O segredo é rezar devagar e soltar o que você não consegue resolver agora.',
      },
      {
        question: 'E se eu acordar de madrugada ansioso?',
        answer:
          'Repita só uma frase, como "Senhor, fica comigo", em vez de tentar rezar tudo. A repetição calma ajuda a voltar a dormir.',
      },
    ],
  },
  {
    slug: 'oracao-da-noite',
    kind: 'prayer',
    intent: 'night',
    topicSlug: 'oracoes-da-noite',
    relatedIntents: ['sleep', 'gratitude', 'protection'],
    title: 'Oração da noite para agradecer e descansar',
    answer:
      'Uma oração pra encerrar o dia agradecendo, pedindo perdão pelo que faltou e entregando o sono e a casa a Deus. Boa pra rezar sozinho ou em família antes de dormir.',
    summary:
      'Uma oração de fim de dia: gratidão pelo que passou, perdão pelo que pesou e pedido de uma noite tranquila.',
    chunks: [
      c(
        'oracao',
        `<h2>A oração</h2>
        <p class="scripture">Obrigado, Senhor, por mais esse dia. Pelo que foi bom, eu agradeço. Pelo que eu errei, eu te peço perdão e recomeço amanhã.</p>
        <p class="scripture">Abençoa a minha casa e cada pessoa que dorme sob esse teto. Guarda o nosso sono e renova as nossas forças. Que a gente acorde com paz. Amém.</p>`,
      ),
      c(
        'em-familia',
        `<h2>Pra rezar em família</h2>
        <p>É uma oração boa pra dizer junto antes de apagar a luz. Cada um pode acrescentar um nome ou um obrigado do dia. Em poucos minutos, vira um momento simples de encontro antes do descanso.</p>`,
      ),
    ],
    faq: [
      {
        question: 'O que falar na oração da noite?',
        answer:
          'Agradeça pelo dia, peça perdão pelo que faltou e entregue o sono e as pessoas da casa a Deus. Não precisa ser longo, precisa ser sincero.',
      },
      {
        question: 'Dá pra rezar a oração da noite com as crianças?',
        answer:
          'Dá, e ajuda a criar um hábito bom. Deixe cada um dizer um obrigado do dia antes de dormir.',
      },
    ],
  },
  {
    slug: 'oracao-da-manha',
    kind: 'prayer',
    intent: 'morning',
    topicSlug: 'oracoes-da-manha',
    relatedIntents: ['gratitude', 'faith', 'hope'],
    title: 'Oração da manhã para começar o dia com Deus',
    answer:
      'Uma oração curta pra rezar ao acordar, antes do celular e da correria. Você agradece pelo novo dia e pede pra atravessá-lo com fé, leveza e bondade.',
    summary:
      'Uma oração de começo de dia: gratidão por acordar, entrega das tarefas e pedido de presença de Deus em cada hora.',
    chunks: [
      c(
        'oracao',
        `<h2>A oração</h2>
        <p class="scripture">Obrigado, Senhor, por mais um dia. Antes da pressa, eu paro e te entrego essas horas que vêm.</p>
        <p class="scripture">Que eu ande hoje com fé, com leveza e com bondade. Me ajuda no que for difícil e me lembra do que importa. Caminha comigo. Amém.</p>`,
      ),
      c(
        'como-usar',
        `<h2>Antes do celular</h2>
        <p>Tente rezar isso ainda na cama, antes de pegar o telefone. São trinta segundos que mudam o tom do dia. Se quiser, escolha uma palavra pra levar com você: paz, calma, coragem. Volte nela quando o dia apertar.</p>`,
      ),
    ],
    faq: [
      {
        question: 'Qual a melhor oração pra começar o dia?',
        answer:
          'Uma oração curta de gratidão e entrega, rezada antes da correria, costuma ajudar mais do que uma longa feita no automático.',
      },
      {
        question: 'Quanto tempo leva a oração da manhã?',
        answer:
          'Menos de um minuto. O importante é parar de verdade, mesmo que rápido, antes de mergulhar nas tarefas.',
      },
    ],
  },
  {
    slug: 'oracao-contra-a-ansiedade',
    kind: 'prayer',
    intent: 'anxiety',
    topicSlug: 'ansiedade-e-paz',
    relatedIntents: ['fear', 'faith', 'sleep'],
    title: 'Oração contra a ansiedade para acalmar o coração',
    answer:
      'Uma oração pra rezar quando o peito aperta e a cabeça acelera. Você entrega o que não controla, pede que Deus tome o peso das suas mãos e respira de volta pra paz.',
    summary:
      'Uma oração de entrega pros momentos de ansiedade. Curta de propósito, pra rezar respirando, quando a cabeça não para.',
    chunks: [
      c(
        'oracao',
        `<h2>A oração</h2>
        <p class="scripture">Senhor, eu entrego o que eu não consigo controlar. Toma o peso das minhas mãos, porque elas já estão cansadas de segurar tudo.</p>
        <p class="scripture">Acalma o meu peito. Me lembra de respirar. Um passo de cada vez, uma hora de cada vez. Eu confio em ti. Amém.</p>`,
      ),
      c(
        'respira',
        `<h2>Reze respirando</h2>
        <p>Tente assim: inspire enquanto pensa "eu entrego", segure um instante, e solte o ar enquanto pensa "tu cuidas". Repita umas cinco vezes. A oração não tira o problema na hora, mas tira você do modo alarme e te devolve ao chão.</p>
        <p>A ansiedade quase sempre mora no futuro, no "e se". A oração te traz de volta pro agora, que é onde dá pra dar o próximo passo.</p>`,
      ),
    ],
    faq: [
      {
        question: 'Qual oração ajuda na crise de ansiedade?',
        answer:
          'Uma oração curta de entrega, rezada devagar e junto com a respiração, ajuda a sair do modo alarme. Repetir uma frase só já acalma.',
      },
      {
        question: 'A oração substitui o tratamento da ansiedade?',
        answer:
          'Não. A oração ajuda a acalmar e a confiar, mas ansiedade que atrapalha a vida pede também ajuda de um profissional de saúde. Uma coisa não exclui a outra.',
      },
      {
        question: 'Quantas vezes posso rezar essa oração?',
        answer:
          'Quantas precisar. Não tem limite. Repetir uma frase curta várias vezes no dia é um jeito simples de voltar pra paz.',
      },
    ],
  },
  {
    slug: 'oracao-a-santo-judas-tadeu',
    kind: 'prayer',
    intent: 'hope',
    topicSlug: 'oracoes-aos-santos',
    relatedIntents: ['faith', 'finances', 'healing'],
    title: 'Oração a Santo Judas Tadeu, das causas difíceis',
    answer:
      'Santo Judas Tadeu é o santo das causas difíceis e impossíveis. Esta oração pede a intercessão dele numa situação que parece sem saída, sem deixar de confiar que Deus age no tempo certo.',
    summary:
      'Uma oração de pedido e esperança pra causas que parecem perdidas, com a intercessão de Santo Judas Tadeu, festejado em 28 de outubro.',
    chunks: [
      c(
        'oracao',
        `<h2>A oração</h2>
        <p class="scripture">São Judas Tadeu, amigo e apóstolo de Jesus, intercede por mim nesta causa que parece impossível.</p>
        <p class="scripture">Tu que ajudas nas situações sem saída, alcança pra mim a graça que eu peço, se for pro meu bem, e a confiança pra esperar a resposta de Deus. Amém.</p>`,
      ),
      c(
        'quem-foi',
        `<h2>Quem foi Santo Judas Tadeu</h2>
        <p>Judas Tadeu foi um dos doze apóstolos de Jesus, e não deve ser confundido com Judas Iscariotes, que foi outro. Ao longo do tempo, ele ficou conhecido como o santo das causas difíceis, aquelas em que a pessoa já não sabe mais a quem recorrer.</p>
        <p>A festa dele é no dia 28 de outubro, data em que muitas igrejas ficam cheias de gente levando pedidos e agradecimentos.</p>`,
      ),
    ],
    faq: [
      {
        question: 'Para que serve a oração a Santo Judas Tadeu?',
        answer:
          'É rezada em causas difíceis ou que parecem impossíveis, como questões de saúde, trabalho, família ou finanças. Pede a intercessão dele e a confiança pra esperar.',
      },
      {
        question: 'Qual o dia de Santo Judas Tadeu?',
        answer:
          'O dia 28 de outubro. É comum rezar uma novena nos nove dias que antecedem a data.',
      },
      {
        question: 'Santo Judas Tadeu é o mesmo que Judas Iscariotes?',
        answer:
          'Não. São pessoas diferentes. Judas Tadeu foi apóstolo fiel de Jesus. Judas Iscariotes foi quem o traiu.',
      },
    ],
  },
  {
    slug: 'oracao-pela-familia',
    kind: 'prayer',
    intent: 'family',
    topicSlug: 'familia',
    relatedIntents: ['protection', 'gratitude', 'healing'],
    title: 'Oração pela família, pela casa e pelos filhos',
    answer:
      'Uma oração pra pedir paz, união e proteção pra sua casa. Você apresenta a Deus cada pessoa da família, inclusive as que estão longe ou em conflito, e pede um lar com mais escuta e menos cobrança.',
    summary:
      'Uma oração pela família e pelo lar: proteção, união e a graça de cuidar uns dos outros mesmo nos dias difíceis.',
    chunks: [
      c(
        'oracao',
        `<h2>A oração</h2>
        <p class="scripture">Senhor, abençoa a minha família. Cada um que mora comigo e cada um que está longe, mas continua no meu coração.</p>
        <p class="scripture">Onde tem mágoa, traz reconciliação. Onde tem cansaço, traz descanso. Ensina a gente a se escutar com paciência e a se cuidar com carinho. Guarda a nossa casa. Amém.</p>`,
      ),
      c(
        'dia-a-dia',
        `<h2>A família real, não a ideal</h2>
        <p>Nenhuma família é perfeita, e rezar por ela não é fingir que tudo vai bem. É apresentar a Deus o que está bom e o que está difícil. Você pode rezar trocando "a minha família" pelos nomes de cada um, um por um. Reze especialmente por quem anda mais difícil de amar nesses dias.</p>`,
      ),
    ],
    faq: [
      {
        question: 'Como rezar pela minha família?',
        answer:
          'Apresente a Deus cada pessoa pelo nome, agradeça pelo que há de bom e peça paz onde há conflito. Vale rezar sozinho ou reunir a casa.',
      },
      {
        question: 'Existe oração pela proteção da casa?',
        answer:
          'Sim. Esta mesma oração pede guarda pelo lar. Muita gente reza ao chegar em casa ou antes de dormir, pedindo proteção pra todos que vivem ali.',
      },
    ],
  },
  {
    slug: 'oracao-pelos-filhos',
    kind: 'prayer',
    intent: 'family',
    topicSlug: 'familia',
    relatedIntents: ['protection', 'faith', 'healing'],
    title: 'Oração pelos filhos: proteção, saúde e bom caminho',
    answer:
      'Uma oração de mãe e de pai pra entregar os filhos a Deus todos os dias. Você pede proteção, saúde e sabedoria pra eles, e calma pra você confiar no que não consegue controlar.',
    summary:
      'Uma oração pelos filhos: pedir proteção, bom caminho e fé, dos primeiros passos à vida adulta, mesmo quando eles estão longe.',
    chunks: [
      c(
        'oracao',
        `<h2>A oração pelos filhos</h2>
        <p class="scripture">Senhor, eu te entrego os meus filhos. Guarda cada passo deles, no caminho de casa e longe dos meus olhos.</p>
        <p class="scripture">Dá saúde ao corpo, paz ao coração e boas companhias. Que eles cresçam sabendo o que é certo, e que sintam, mesmo sem eu estar perto, que são amados por ti e por mim. Me ajuda a confiar quando eu não puder proteger. Amém.</p>`,
      ),
      c(
        'soltar-e-confiar',
        `<h2>Rezar é também aprender a soltar</h2>
        <p>Tem uma hora em que a gente não consegue mais ir junto: a escola, a rua, a vida adulta, as escolhas que são só deles. Rezar pelos filhos é entregar o que o nosso braço já não alcança. Não é deixar de cuidar, é cuidar do jeito que ainda dá, com oração e presença.</p>
        <p>Você pode rezar trocando "os meus filhos" pelo nome de cada um, um por um. Reze também pelos que estão em fase difícil, distantes ou em conflito. O amor não desiste, e a oração mantém a porta aberta.</p>`,
      ),
    ],
    faq: [
      {
        question: 'Como rezar pelos filhos todos os dias?',
        answer:
          'Reze pelo nome de cada um, peça proteção, saúde e bom caminho, e entregue a Deus o que você não controla. Muita mãe e pai rezam de manhã, ao acordar os filhos, ou à noite, antes de dormir.',
      },
      {
        question: 'Qual versículo rezar pelos filhos?',
        answer:
          'Provérbios 22, 6 ("ensina a criança no caminho em que deve andar") e Salmo 127, 3 ("os filhos são herança do Senhor") são dos mais rezados pela vida dos filhos.',
      },
      {
        question: 'Existe oração por um filho distante ou rebelde?',
        answer:
          'Sim. Esta mesma oração serve: você apresenta o filho a Deus pelo nome, pede que ele encontre bom caminho e boas companhias, e pede pra você a paciência de amar sem desistir.',
      },
    ],
  },
  {
    slug: 'oracao-pelas-financas',
    kind: 'prayer',
    intent: 'finances',
    topicSlug: 'financas-e-trabalho',
    relatedIntents: ['anxiety', 'hope', 'faith'],
    title: 'Oração pelas finanças e pelo trabalho em tempo de aperto',
    answer:
      'Uma oração pra rezar quando as contas apertam e o medo do fim do mês bate. Você pede provisão, sabedoria pra cuidar do que tem e calma pra não decidir no desespero.',
    summary:
      'Uma oração pra momentos de dificuldade financeira: pedir provisão e trabalho, sem perder a paz nem a sabedoria pra cada escolha.',
    chunks: [
      c(
        'oracao',
        `<h2>A oração</h2>
        <p class="scripture">Senhor, tu sabes das minhas contas e do meu cansaço. Eu não venho pedir luxo, venho pedir o pão de cada dia e portas que se abram pro meu trabalho.</p>
        <p class="scripture">Me dá sabedoria pra cuidar do pouco e do muito, e calma pra não decidir no desespero. Tira de mim a vergonha e o medo. Eu confio que não vou faltar diante de ti. Amém.</p>`,
      ),
      c(
        'fe-e-acao',
        `<h2>Fé que anda junto com atitude</h2>
        <p>Rezar pelas finanças não é esperar dinheiro caindo do céu. É pedir paz pra pensar com clareza e coragem pra agir. Depois de rezar, costuma ajudar fazer uma coisa concreta: anotar o que entra e o que sai, conversar sobre uma dívida, pedir uma orientação, mandar aquele currículo.</p>
        <p>A oração tira o peso do peito pra que a cabeça volte a funcionar. Muita decisão ruim com dinheiro nasce do pânico, não da falta de opção.</p>`,
      ),
      c(
        'quando-aperta',
        `<h2>Quando o aperto não passa logo</h2>
        <p>Tem épocas em que a resposta demora, e isso cansa a fé. Nesses dias, rezar é também não desistir de si mesmo. Você não está sozinho nessa conta. Peça ajuda a quem confia, divida o peso, e lembre que o seu valor não está no saldo da conta.</p>`,
      ),
    ],
    faq: [
      {
        question: 'Qual oração rezar por dificuldades financeiras?',
        answer:
          'Uma oração que peça provisão e trabalho, mas também sabedoria e calma pra decidir. Pedir paz pra pensar costuma ser tão importante quanto pedir o dinheiro em si.',
      },
      {
        question: 'Existe um santo ou salmo pras finanças?',
        answer:
          'Muita gente reza a Santo Antônio, a São José operário ou pede a intercessão de Santo Judas Tadeu nas causas difíceis. O Salmo 23, com seu "nada me faltará", também conforta nesses momentos.',
      },
      {
        question: 'Rezar resolve problema de dinheiro?',
        answer:
          'A oração acalma e dá clareza, mas anda junto com atitude: organizar as contas, buscar trabalho, pedir orientação. Fé e ação caminham lado a lado.',
      },
    ],
  },
  {
    slug: 'oracao-pela-cura',
    kind: 'prayer',
    intent: 'healing',
    topicSlug: 'cura',
    relatedIntents: ['faith', 'hope', 'family'],
    title: 'Oração pela cura do corpo e da alma',
    answer:
      'Uma oração pra rezar por você ou por alguém que está doente. Você pede saúde, mãos sábias pra quem cuida e, acima de tudo, paz pra atravessar o tratamento com esperança.',
    summary:
      'Uma oração pela cura e pela saúde, pedindo restauração do corpo, alívio da alma e confiança no cuidado de Deus durante o tratamento.',
    chunks: [
      c(
        'oracao',
        `<h2>A oração</h2>
        <p class="scripture">Senhor, que cuidas de cada parte de mim, toca onde dói. Restaura o meu corpo e acalma a minha alma.</p>
        <p class="scripture">Abençoa as mãos dos médicos e de quem cuida de mim. Me dá paciência nos dias difíceis e esperança quando a melhora demora. Eu me entrego no teu cuidado. Amém.</p>`,
      ),
      c(
        'por-alguem',
        `<h2>Rezando por outra pessoa</h2>
        <p>Se a oração é por alguém que você ama, troque "de mim" pelo nome dela. Rezar por quem está doente é uma forma de estar perto mesmo quando não dá pra fazer mais nada. E cuidar de quem cuida também é oração: descansar, comer, respirar. Ninguém sustenta o outro de tanque vazio.</p>`,
      ),
    ],
    faq: [
      {
        question: 'Qual oração rezar por uma pessoa doente?',
        answer:
          'Uma oração que peça cura, mas também paz e força pra atravessar o tratamento. Troque as palavras pra falar o nome de quem está doente.',
      },
      {
        question: 'A oração pela cura substitui o médico?',
        answer:
          'Não. A oração caminha junto com o tratamento. Pedir saúde inclui pedir sabedoria pros médicos e fidelidade pra seguir as orientações.',
      },
    ],
  },
  {
    slug: 'oracao-de-gratidao',
    kind: 'prayer',
    intent: 'gratitude',
    topicSlug: 'gratidao',
    relatedIntents: ['faith', 'morning', 'hope'],
    title: 'Oração de gratidão para agradecer a Deus',
    answer:
      'Uma oração curta pra agradecer, mesmo nos dias comuns. Você para um instante pra reconhecer o que recebeu, do pão na mesa às pessoas ao lado, e deixa o coração mais leve.',
    summary:
      'Uma oração de gratidão pra qualquer hora do dia. Ajuda a enxergar o que já existe de bom, em vez de só correr atrás do que falta.',
    chunks: [
      c(
        'oracao',
        `<h2>A oração</h2>
        <p class="scripture">Obrigado, Senhor, pelo que eu tenho e às vezes nem percebo. Pelo ar, pela comida, pelo teto, pelas pessoas que ficam.</p>
        <p class="scripture">Obrigado até pelo que foi difícil e me ensinou algo. Ensina o meu coração a reparar mais no bem. Que a gratidão seja o meu jeito de viver. Amém.</p>`,
      ),
      c(
        'pratica',
        `<h2>Um exercício simples</h2>
        <p>Antes de dormir, lembre de três coisas boas do dia, por menores que sejam. Um café, uma conversa, um problema que não aconteceu. A gratidão não nega o que está difícil, ela só evita que a gente esqueça do que está bom no meio da correria.</p>`,
      ),
    ],
    faq: [
      {
        question: 'Por que rezar uma oração de gratidão?',
        answer:
          'Porque ela muda o foco. Em vez de olhar só pro que falta, você reconhece o que já recebeu, e isso acalma e dá mais paz.',
      },
      {
        question: 'Dá pra agradecer mesmo num dia ruim?',
        answer:
          'Dá. A gratidão não finge que está tudo bem. Ela encontra o pouco de bom que ainda existe, mesmo num dia pesado.',
      },
    ],
  },
  {
    slug: 'oracao-no-luto',
    kind: 'prayer',
    intent: 'grief',
    topicSlug: 'luto-e-consolo',
    relatedIntents: ['hope', 'faith', 'healing'],
    title: 'Oração no luto, pela perda de quem a gente ama',
    answer:
      'Uma oração pra rezar na dor da perda. Ela não promete que a saudade vai embora, mas pede consolo, descanso pra quem partiu e força pra você seguir com o coração ferido.',
    summary:
      'Uma oração de consolo no luto. Acolhe a saudade sem pressa, pede paz pra quem partiu e amparo pra quem ficou.',
    chunks: [
      c(
        'oracao',
        `<h2>A oração</h2>
        <p class="scripture">Senhor, a saudade é grande e eu não vou fingir que não dói. Cuida de quem partiu e dá descanso a essa alma que eu amo.</p>
        <p class="scripture">E cuida de mim, que fiquei. Me ajuda a chorar o quanto eu precisar e a encontrar, no meu tempo, um caminho de volta pra vida. Não me deixa sozinho nessa travessia. Amém.</p>`,
      ),
      c(
        'sem-pressa',
        `<h2>O luto tem o tempo dele</h2>
        <p>Não existe prazo pra dor da perda, e ninguém precisa "estar bem" rápido pra agradar os outros. Chorar é parte de amar. Rezar no luto não apaga a falta, mas coloca essa falta nas mãos de alguém maior, e isso pode ser o primeiro respiro de paz no meio da tempestade.</p>`,
      ),
    ],
    faq: [
      {
        question: 'O que rezar quando perdemos alguém?',
        answer:
          'Uma oração que peça descanso pra quem partiu e consolo pra quem ficou. Não há palavras perfeitas. A oração serve pra entregar a dor, não pra escondê-la.',
      },
      {
        question: 'É normal sentir raiva ou dúvida na fé durante o luto?',
        answer:
          'É muito normal. Deus aguenta as suas perguntas e a sua raiva. Levar isso pra oração, com sinceridade, também é um jeito de rezar.',
      },
    ],
  },
  {
    slug: 'oracao-para-vencer-o-medo',
    kind: 'prayer',
    intent: 'fear',
    topicSlug: 'ansiedade-e-paz',
    relatedIntents: ['anxiety', 'faith', 'protection'],
    title: 'Oração para vencer o medo e ter coragem',
    answer:
      'Uma oração pra quando o medo trava você. Ela não promete que o perigo some, mas pede coragem pra dar o próximo passo sabendo que você não está sozinho.',
    summary:
      'Uma oração contra o medo. Reconhece o que assusta e pede coragem e companhia pra atravessar mesmo assim.',
    chunks: [
      c(
        'oracao',
        `<h2>A oração</h2>
        <p class="scripture">Senhor, o medo está aqui e eu não vou esconder. Mas eu não quero que ele decida por mim.</p>
        <p class="scripture">Caminha comigo pra dentro do que me assusta. Me dá coragem pro próximo passo, só o próximo. Onde eu sou fraco, sê tu a minha força. Amém.</p>`,
      ),
      c(
        'um-passo',
        `<h2>Coragem é um passo de cada vez</h2>
        <p>Coragem não é não sentir medo, é seguir mesmo sentindo. A oração ajuda a separar o medo real do medo inventado pela cabeça, e a focar no que dá pra fazer agora. Você não precisa enxergar o caminho inteiro. Só o próximo passo.</p>`,
      ),
    ],
    faq: [
      {
        question: 'Qual oração ajuda a vencer o medo?',
        answer:
          'Uma oração que peça coragem e companhia, não a garantia de que nada de ruim vai acontecer. A força vem de saber que você não atravessa sozinho.',
      },
      {
        question: 'Qual salmo rezar contra o medo?',
        answer:
          'O Salmo 27, que começa com "O Senhor é a minha luz, a quem temerei", e o Salmo 91 são dois dos mais rezados em momentos de medo.',
      },
    ],
  },
  {
    slug: 'oracao-de-perdao',
    kind: 'prayer',
    intent: 'forgiveness',
    topicSlug: 'perdao',
    relatedIntents: ['faith', 'healing', 'family'],
    title: 'Oração de perdão para soltar o peso da mágoa',
    answer:
      'Uma oração pra quem precisa perdoar ou ser perdoado. Ela ajuda a soltar a mágoa que pesa, sem fingir que não houve dor, e a pedir um coração mais livre.',
    summary:
      'Uma oração sobre perdão nos dois sentidos: pedir e oferecer. Acolhe a dor e pede coragem pra soltar o peso.',
    chunks: [
      c(
        'oracao',
        `<h2>A oração</h2>
        <p class="scripture">Senhor, tem coisa que ainda dói e que eu carrego faz tempo. Eu quero soltar esse peso, mas sozinho eu não consigo.</p>
        <p class="scripture">Me ajuda a perdoar quem me feriu, não porque o que fizeram foi pequeno, mas porque eu não quero mais viver preso a isso. E me perdoa pelo que eu fiz de errado. Me dá um coração mais leve. Amém.</p>`,
      ),
      c(
        'o-que-e',
        `<h2>Perdoar não é fingir que não houve dor</h2>
        <p>Perdão não significa dizer que o que aconteceu não teve importância, nem voltar pra uma situação que machuca. É deixar de beber o veneno todo dia esperando que o outro adoeça. Você perdoa primeiro por você, pra parar de carregar. Às vezes isso leva tempo e precisa ser rezado muitas vezes. Tudo bem.</p>`,
      ),
    ],
    faq: [
      {
        question: 'Como rezar para conseguir perdoar alguém?',
        answer:
          'Comece sendo sincero sobre a dor. Peça a Deus o desejo de perdoar, mesmo que você ainda não sinta vontade. O perdão costuma ser um caminho, não um clique.',
      },
      {
        question: 'Perdoar quer dizer aceitar o que me fizeram?',
        answer:
          'Não. Perdoar é se libertar do peso, não aprovar o erro nem voltar pra algo que faz mal. Dá pra perdoar e ainda assim manter distância saudável.',
      },
    ],
  },
  {
    slug: 'oracao-sao-miguel-arcanjo',
    kind: 'prayer',
    intent: 'protection',
    topicSlug: 'oracoes-aos-santos',
    relatedIntents: ['fear', 'faith', 'family'],
    title: 'Oração de São Miguel Arcanjo: a oração forte de proteção',
    answer:
      'A oração de São Miguel Arcanjo é uma das mais rezadas pra pedir proteção contra o mal. Escrita pelo Papa Leão XIII, ela pede que o arcanjo defenda você no combate espiritual e afaste todo perigo do corpo e da alma.',
    summary:
      'A oração forte de São Miguel Arcanjo, pra pedir proteção e coragem em momentos de medo, luta interior ou quando algo parece pesado demais.',
    chunks: [
      c(
        'oracao',
        `<h2>A oração de São Miguel Arcanjo</h2>
        <p class="scripture">São Miguel Arcanjo, defendei-nos no combate. Sede o nosso refúgio contra a maldade e as ciladas do inimigo.</p>
        <p class="scripture">Ordene-lhe Deus, instantemente o pedimos. E vós, príncipe da milícia celeste, afastai pra longe de nós, com a força de Deus, todo mal que ronda a nossa vida e a dos que amamos. Amém.</p>`,
      ),
      c(
        'quem-foi',
        `<h2>Quem é São Miguel Arcanjo</h2>
        <p>Miguel é o arcanjo apresentado na Bíblia como o que enfrenta o mal e defende o povo de Deus. O nome dele quer dizer "quem como Deus?", uma pergunta que já é resposta: ninguém está acima do Senhor.</p>
        <p>Por isso ele é invocado como protetor nos momentos de luta, seja a luta de fora, com situações difíceis, seja a de dentro, com o medo e o desânimo. A festa dele é em 29 de setembro, junto com os arcanjos Gabriel e Rafael.</p>`,
      ),
      c(
        'quando-rezar',
        `<h2>Quando rezar</h2>
        <p>Muita gente reza essa oração ao acordar, pra começar o dia coberto, e à noite, pra entregar o sono em paz. Ela também é rezada em momentos de medo, de tentação ou quando o ambiente parece pesado. Não é fórmula mágica: é pedir a Deus, pela intercessão do arcanjo, a coragem que falta e a proteção que a gente não dá conta sozinho.</p>`,
      ),
    ],
    faq: [
      {
        question: 'Para que serve a oração de São Miguel Arcanjo?',
        answer:
          'É rezada pra pedir proteção contra o mal e coragem nos momentos de medo ou luta interior. Muita gente reza ao acordar e antes de dormir.',
      },
      {
        question: 'Quem escreveu a oração de São Miguel?',
        answer:
          'A versão mais conhecida foi escrita pelo Papa Leão XIII, no fim do século XIX, e desde então é rezada no mundo todo.',
      },
      {
        question: 'Qual o dia de São Miguel Arcanjo?',
        answer:
          'O dia 29 de setembro, celebrado junto com os arcanjos Gabriel e Rafael. Muita gente reza uma novena nos nove dias anteriores.',
      },
    ],
  },
  {
    slug: 'oracao-santa-rita',
    kind: 'prayer',
    intent: 'hope',
    topicSlug: 'oracoes-aos-santos',
    relatedIntents: ['faith', 'family', 'healing'],
    title: 'Oração a Santa Rita de Cássia, das causas impossíveis',
    answer:
      'Santa Rita de Cássia é conhecida como a santa das causas impossíveis. Esta oração pede a intercessão dela numa situação que parece sem saída, confiando que Deus ainda pode abrir um caminho.',
    summary:
      'Uma oração de esperança e pedido a Santa Rita de Cássia, pra causas que parecem perdidas, no casamento, na família, na saúde ou no trabalho.',
    chunks: [
      c(
        'oracao',
        `<h2>A oração a Santa Rita</h2>
        <p class="scripture">Ó gloriosa Santa Rita, advogada das causas impossíveis e desesperadas, olhai por mim nesta aflição em que me encontro.</p>
        <p class="scripture">Vós que recebestes de Deus o dom de socorrer justamente onde a esperança parece perdida, alcançai pra mim a graça que eu tanto peço, se for pro bem da minha vida e da minha alma. E me dai a paciência de esperar a resposta no tempo de Deus. Amém.</p>`,
      ),
      c(
        'quem-foi',
        `<h2>Quem foi Santa Rita de Cássia</h2>
        <p>Rita viveu na Itália, no século XIV. Atravessou um casamento difícil, perdeu o marido e os filhos, e só mais tarde realizou o desejo antigo de entrar pra vida religiosa. A história dela é de quem viu muita porta fechada e mesmo assim não perdeu a fé.</p>
        <p>Talvez por isso ela tenha ficado conhecida como a santa das causas impossíveis: gente que reza a ela costuma estar justamente naquele ponto em que já não sabe mais o que fazer. A festa dela é em 22 de maio.</p>`,
      ),
      c(
        'como-rezar',
        `<h2>Como rezar nas causas difíceis</h2>
        <p>Rezar a Santa Rita não é cobrar de Deus um resultado, é entregar a causa e pedir força pra continuar. Diga com suas palavras qual é a situação, sem enfeitar. Peça a graça, mas peça também serenidade pra qualquer que seja a resposta. Muita gente reza uma novena, nove dias seguidos, mantendo o mesmo pedido.</p>`,
      ),
    ],
    faq: [
      {
        question: 'Para que serve a oração a Santa Rita?',
        answer:
          'É rezada em causas que parecem impossíveis ou sem saída, como questões de casamento, família, saúde e trabalho. Pede a intercessão dela e a confiança pra esperar.',
      },
      {
        question: 'Qual o dia de Santa Rita de Cássia?',
        answer:
          'O dia 22 de maio. É comum rezar uma novena nos nove dias que antecedem a data, levando um mesmo pedido.',
      },
      {
        question: 'Qual a diferença entre Santa Rita e Santo Judas Tadeu?',
        answer:
          'Os dois são lembrados nas causas difíceis. Santo Judas Tadeu foi apóstolo de Jesus; Santa Rita foi uma religiosa que viveu na Itália. Muita gente reza aos dois pelo mesmo motivo: esperança em situações sem saída.',
      },
    ],
  },
  {
    slug: 'oracao-sao-bento',
    kind: 'prayer',
    intent: 'protection',
    topicSlug: 'oracoes-aos-santos',
    relatedIntents: ['fear', 'faith'],
    title: 'Oração de São Bento: proteção contra o mal e os inimigos',
    answer:
      'A oração de São Bento pede proteção contra todo mal e contra as ciladas do inimigo. É associada à medalha de São Bento, conhecida como um sinal de fé e de guarda pra casa, a família e a vida espiritual.',
    summary:
      'Uma oração de proteção a São Bento, pra pedir guarda contra o mal, paz na casa e firmeza na fé, junto com a tradicional medalha.',
    chunks: [
      c(
        'oracao',
        `<h2>A oração de São Bento</h2>
        <p class="scripture">Glorioso São Bento, exemplo de fé e vaso da graça de Deus, eu venho pedir a vossa proteção.</p>
        <p class="scripture">Livrai-me das ciladas do mal, afastai de mim e da minha casa todo perigo do corpo e da alma, e ajudai-me a permanecer firme no bem. Que a cruz seja a minha luz e nunca o mal seja o meu guia. Amém.</p>`,
      ),
      c(
        'medalha',
        `<h2>A medalha de São Bento</h2>
        <p>A medalha de São Bento traz letras que são as iniciais de uma oração curta em latim contra o mal, algo como "que a cruz santa seja a minha luz, que o demônio não seja o meu guia". Muita gente usa a medalha, coloca na porta de casa ou no carro como um lembrete de fé e proteção.</p>
        <p>A medalha não é amuleto. Ela vale pelo que representa: a confiança em Deus e o desejo de andar no caminho do bem. O que protege é a fé, não o metal.</p>`,
      ),
      c(
        'quem-foi',
        `<h2>Quem foi São Bento</h2>
        <p>Bento de Núrsia viveu na Itália entre os séculos V e VI e é considerado o pai da vida monástica no Ocidente. Ele resumiu a espiritualidade em algo simples e profundo: "reza e trabalha". A festa dele é em 11 de julho.</p>`,
      ),
    ],
    faq: [
      {
        question: 'Para que serve a oração de São Bento?',
        answer:
          'É rezada pra pedir proteção contra o mal, guarda pra casa e pra família, e firmeza na vida de fé. Costuma vir acompanhada da medalha de São Bento.',
      },
      {
        question: 'A medalha de São Bento protege mesmo?',
        answer:
          'A medalha é um sinal de fé, não um amuleto. O que protege é a confiança em Deus que ela representa, junto com a oração e a vida no caminho do bem.',
      },
      {
        question: 'Qual o dia de São Bento?',
        answer:
          'O dia 11 de julho. São Bento é lembrado como pai da vida monástica e pelo lema "reza e trabalha".',
      },
    ],
  },
  {
    slug: 'oracao-jabez',
    kind: 'prayer',
    intent: 'finances',
    topicSlug: 'financas-e-trabalho',
    relatedIntents: ['hope', 'faith', 'gratitude'],
    title: 'Oração de Jabez: pedir bênção e abrir caminhos com fé',
    answer:
      'A oração de Jabez está em 1 Crônicas 4:10 e é um pedido direto: que Deus abençoe, alargue os limites, ande junto e livre do mal. É rezada por quem quer ver portas se abrirem no trabalho e na vida, sem perder a humildade.',
    summary:
      'A oração de Jabez, da Bíblia, pra pedir bênção, crescimento e a presença de Deus nos caminhos, com fé e os pés no chão.',
    chunks: [
      c(
        'oracao',
        `<h2>A oração de Jabez</h2>
        <p class="scripture">"Oxalá tu me abençoes muito, e alargues os meus limites, e que a tua mão esteja comigo, e me guardes do mal, para que não me sobrevenha aflição." (1 Crônicas 4, 10)</p>
        <p>Você pode rezar com suas palavras: "Senhor, me abençoa, abre os meus caminhos, fica comigo no que eu for fazer e me guarda do mal. Que o que eu conquistar sirva também pra abençoar outras pessoas. Amém."</p>`,
      ),
      c(
        'quem-foi',
        `<h2>Quem foi Jabez</h2>
        <p>Jabez aparece de passagem na Bíblia, em apenas dois versículos. O texto diz que ele era mais respeitado que os irmãos e que fez essa oração a Deus, e que Deus atendeu o pedido. É uma história pequena que muita gente adotou como oração de recomeço e de coragem pra pedir.</p>`,
      ),
      c(
        'sem-prosperidade-magica',
        `<h2>Pedir bênção sem cair na fé do "toma lá dá cá"</h2>
        <p>Pedir que Deus "alargue os limites" não é pedir luxo nem prometer que a fé vira dinheiro na conta. É pedir caminhos, sabedoria e força pra trabalhar, e a graça de não fazer o mal nem sofrer com ele.</p>
        <p>A oração de Jabez fica mais honesta quando vem com gratidão pelo que já existe e com o desejo de que a bênção transborde pros outros. Fé e trabalho andam juntos: reze, e depois faça a sua parte com calma e capricho.</p>`,
      ),
    ],
    faq: [
      {
        question: 'O que é a oração de Jabez?',
        answer:
          'É uma oração curta tirada da Bíblia, em 1 Crônicas 4:10, na qual Jabez pede a Deus bênção, crescimento, presença e proteção contra o mal. Virou oração popular de recomeço.',
      },
      {
        question: 'A oração de Jabez serve pra prosperidade financeira?',
        answer:
          'Ela pede que Deus abra caminhos e abençoe a vida, o que inclui o trabalho. Mas não é fórmula de enriquecimento: pedir bênção anda junto com gratidão, humildade e atitude.',
      },
      {
        question: 'Onde está a oração de Jabez na Bíblia?',
        answer:
          'No Primeiro Livro de Crônicas, capítulo 4, versículo 10. Jabez é citado em apenas dois versículos, mas a oração dele ficou conhecida no mundo todo.',
      },
    ],
  },
  {
    slug: 'oracao-pai-nosso',
    kind: 'prayer',
    intent: 'faith',
    topicSlug: 'oracoes-essenciais',
    relatedIntents: ['gratitude', 'forgiveness', 'protection'],
    title: 'Oração do Pai Nosso: a oração que Jesus ensinou',
    answer:
      'O Pai Nosso é a oração que o próprio Jesus ensinou aos discípulos, registrada no Evangelho de Mateus. Em poucas linhas, ela louva a Deus, pede o pão de cada dia, o perdão e a proteção contra o mal.',
    summary:
      'A oração do Pai Nosso completa, com a sua origem na Bíblia e o sentido de cada pedido, pra rezar com mais consciência.',
    chunks: [
      c(
        'oracao',
        `<h2>A oração do Pai Nosso</h2>
        <p class="scripture">Pai nosso, que estais nos céus, santificado seja o vosso nome. Venha a nós o vosso reino, seja feita a vossa vontade, assim na terra como no céu.</p>
        <p class="scripture">O pão nosso de cada dia nos dai hoje. Perdoai-nos as nossas ofensas, assim como nós perdoamos a quem nos tem ofendido. E não nos deixeis cair em tentação, mas livrai-nos do mal. Amém.</p>`,
      ),
      c(
        'origem',
        `<h2>De onde vem o Pai Nosso</h2>
        <p>O Pai Nosso está no Evangelho de Mateus, capítulo 6, versículos 9 a 13, e também em Lucas 11. Os discípulos pediram a Jesus "ensina-nos a orar", e ele respondeu com essa oração. Por isso ela é chamada de "oração do Senhor": não foi inventada por nós, foi entregue por ele.</p>
        <p>É a oração mais rezada do mundo cristão, comum a católicos, evangélicos e ortodoxos. Cabe na missa, no culto, no terço e na cama antes de dormir.</p>`,
      ),
      c(
        'significado',
        `<h2>O sentido de cada pedido</h2>
        <p>Repare que o Pai Nosso começa olhando pra Deus ("santificado seja o vosso nome") antes de pedir qualquer coisa. Depois vem o essencial: o pão de hoje, não o estoque do ano. Em seguida, o perdão, ligado à nossa disposição de perdoar os outros. E termina pedindo proteção contra o mal.</p>
        <p>Rezar devagar, parando em cada frase, transforma uma oração decorada num diálogo de verdade. Tente rezar uma vez prestando atenção em cada pedido, como se fosse a primeira.</p>`,
      ),
    ],
    faq: [
      {
        question: 'Como se reza o Pai Nosso?',
        answer:
          'Reza-se assim: "Pai nosso, que estais nos céus, santificado seja o vosso nome. Venha a nós o vosso reino, seja feita a vossa vontade, assim na terra como no céu. O pão nosso de cada dia nos dai hoje. Perdoai-nos as nossas ofensas, assim como nós perdoamos a quem nos tem ofendido. E não nos deixeis cair em tentação, mas livrai-nos do mal. Amém."',
      },
      {
        question: 'Onde está o Pai Nosso na Bíblia?',
        answer:
          'No Evangelho de Mateus, capítulo 6, versículos 9 a 13, e também em Lucas 11, 2-4. Foi o próprio Jesus quem ensinou essa oração aos discípulos.',
      },
      {
        question: 'Qual o significado do Pai Nosso?',
        answer:
          'Ele louva a Deus, pede o pão de cada dia (o necessário), o perdão (ligado a perdoarmos os outros) e a proteção contra o mal. É um resumo de como confiar e depender de Deus.',
      },
    ],
  },
  {
    slug: 'oracao-da-serenidade',
    kind: 'prayer',
    intent: 'anxiety',
    topicSlug: 'ansiedade-e-paz',
    relatedIntents: ['faith', 'hope', 'forgiveness'],
    title: 'Oração da Serenidade: aceitar, mudar e ter sabedoria',
    answer:
      'A Oração da Serenidade pede três coisas: serenidade pra aceitar o que não dá pra mudar, coragem pra mudar o que é possível e sabedoria pra saber a diferença. É muito rezada em momentos de ansiedade e recomeço.',
    summary:
      'A Oração da Serenidade, pra acalmar o coração diante do que foge ao nosso controle e encontrar paz pra seguir em frente.',
    chunks: [
      c(
        'oracao',
        `<h2>A Oração da Serenidade</h2>
        <p class="scripture">Senhor, concedei-me a serenidade necessária para aceitar as coisas que não posso modificar, coragem para modificar aquelas que posso, e sabedoria para distinguir umas das outras. Amém.</p>`,
      ),
      c(
        'sobre',
        `<h2>De onde vem e por que ajuda</h2>
        <p>A Oração da Serenidade ficou conhecida no mundo todo no século XX e é rezada por muita gente em processos de recomeço, recuperação e em qualquer momento de ansiedade. O segredo dela está em separar duas coisas que a gente costuma misturar: o que está nas nossas mãos e o que não está.</p>
        <p>Boa parte da ansiedade nasce de gastar energia tentando controlar o incontrolável. Esta oração devolve o foco: aja no que é seu, entregue o resto e peça discernimento pra saber qual é qual.</p>`,
      ),
    ],
    faq: [
      {
        question: 'Como é a Oração da Serenidade completa?',
        answer:
          '"Senhor, concedei-me a serenidade necessária para aceitar as coisas que não posso modificar, coragem para modificar aquelas que posso, e sabedoria para distinguir umas das outras." Existem versões mais longas, mas essa é a parte mais conhecida.',
      },
      {
        question: 'Para que serve a Oração da Serenidade?',
        answer:
          'Pra acalmar diante do que não se pode controlar, ganhar coragem pra agir no que é possível e pedir sabedoria pra distinguir os dois. É muito usada em momentos de ansiedade e recomeço.',
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* DEVOCIONAIS                                                         */
/* ------------------------------------------------------------------ */

const DEVOTIONALS = [
  {
    slug: 'devocional-descansar-a-sombra',
    kind: 'devotional',
    intent: 'protection',
    topicSlug: 'salmos-de-protecao',
    relatedIntents: ['anxiety', 'faith', 'night'],
    title: 'Descansar à sombra: devocional do Salmo 91',
    answer:
      'Quando o dia é forte, a gente não combate o sol, procura sombra. Este devocional parte do Salmo 91 pra lembrar que Deus pode ser esse lugar de descanso, uma frase de cada vez.',
    summary:
      'Devocional curto sobre o Salmo 91 e a imagem do abrigo: uma reflexão, um versículo e uma oração pra acalmar o dia.',
    chunks: [
      c(
        'reflexao',
        `<h2>Reflexão</h2>
        <p>Tem dias em que tudo parece pedir mais do que a gente tem. A imagem do Salmo 91 é simples: numa tarde de sol forte, ninguém enfrenta o calor de peito aberto, a gente procura uma sombra e descansa ali. O salmo diz que Deus pode ser essa sombra.</p>
        <p>Descansar à sombra não é ignorar o que precisa ser feito. É parar de tentar carregar tudo de uma vez. Hoje, escolha uma só preocupação e deixe ela ali, na sombra, por alguns minutos.</p>`,
      ),
      c(
        'versiculo',
        `<h2>O versículo de hoje</h2>
        <p class="scripture">"Aquele que habita no abrigo do Altíssimo descansa à sombra do Todo-Poderoso." (Salmo 91, 1)</p>`,
      ),
      c(
        'oracao',
        `<h2>Oração</h2>
        <p class="scripture">Senhor, hoje eu não dou conta de tudo, e tudo bem. Deixa eu descansar um pouco à tua sombra. Carrega comigo o que pesa demais. Amém.</p>`,
      ),
    ],
    faq: [
      {
        question: 'O que é um devocional?',
        answer:
          'É um momento curto de fé, geralmente com uma reflexão, um versículo e uma oração, pra parar e respirar no meio do dia.',
      },
      {
        question: 'Quanto tempo leva esse devocional?',
        answer:
          'Cerca de dois a três minutos. A ideia é caber num intervalo, antes do trabalho, no transporte ou antes de dormir.',
      },
    ],
  },
  {
    slug: 'devocional-quando-a-ansiedade-aperta',
    kind: 'devotional',
    intent: 'anxiety',
    topicSlug: 'ansiedade-e-paz',
    relatedIntents: ['fear', 'faith', 'sleep'],
    title: 'Quando a ansiedade aperta: devocional pra respirar',
    answer:
      'A ansiedade quase sempre vive no futuro, no "e se". Este devocional usa Mateus 6 pra trazer você de volta pro hoje, que é onde dá pra dar o próximo passo.',
    summary:
      'Devocional sobre ansiedade: uma reflexão sobre viver o hoje, um versículo de Jesus e uma oração curta pra acalmar.',
    chunks: [
      c(
        'reflexao',
        `<h2>Reflexão</h2>
        <p>Repare onde a sua cabeça está quando a ansiedade aperta. Quase nunca no agora. Ela corre pro amanhã, pra conta que vai chegar, pra conversa que talvez aconteça, pro pior cenário possível. Jesus fala disso de um jeito direto: cada dia tem o seu próprio cuidado, não some o de amanhã ao de hoje.</p>
        <p>Não é "não se importe". É "não carregue hoje um peso que é de amanhã". Você não precisa resolver a vida inteira agora. Só o próximo passo.</p>`,
      ),
      c(
        'versiculo',
        `<h2>O versículo de hoje</h2>
        <p class="scripture">"Não se preocupem com o amanhã, pois o amanhã trará as suas próprias preocupações. Basta a cada dia o seu próprio mal." (Mateus 6, 34)</p>`,
      ),
      c(
        'oracao',
        `<h2>Oração</h2>
        <p class="scripture">Senhor, traz a minha cabeça de volta pro hoje. Eu entrego o amanhã, que ainda nem chegou. Por agora, me ajuda a respirar e a dar só o próximo passo. Amém.</p>`,
      ),
    ],
    faq: [
      {
        question: 'A fé ajuda no controle da ansiedade?',
        answer:
          'Ajuda a acalmar e a confiar, e isso faz diferença. Mas ansiedade que atrapalha o dia a dia também pede acompanhamento de um profissional. Fé e cuidado de saúde caminham juntos.',
      },
      {
        question: 'O que a Bíblia fala sobre ansiedade?',
        answer:
          'Vários trechos tratam disso, como Mateus 6 e Filipenses 4, com o convite a entregar as preocupações a Deus e a viver um dia de cada vez.',
      },
    ],
  },
  {
    slug: 'devocional-comecar-o-dia-com-deus',
    kind: 'devotional',
    intent: 'morning',
    topicSlug: 'oracoes-da-manha',
    relatedIntents: ['gratitude', 'faith', 'hope'],
    title: 'Começar o dia com Deus: devocional da manhã',
    answer:
      'Os primeiros minutos do dia dão o tom de tudo. Este devocional propõe trocar o celular por um instante de fé ao acordar, com um versículo do Salmo 143 e uma oração curta.',
    summary:
      'Devocional pra começar a manhã com calma: uma reflexão sobre os primeiros minutos do dia, um versículo e uma oração.',
    chunks: [
      c(
        'reflexao',
        `<h2>Reflexão</h2>
        <p>Repare no que você faz nos primeiros cinco minutos depois de acordar. Pra muita gente, é pegar o celular e já entrar na correria, nas notícias, nas mensagens. O dia começa reagindo, não escolhendo.</p>
        <p>Tente o contrário hoje: antes de qualquer tela, respire e diga um obrigado. Só isso já muda o tom. Você não controla o que o dia traz, mas controla com que coração entra nele.</p>`,
      ),
      c(
        'versiculo',
        `<h2>O versículo de hoje</h2>
        <p class="scripture">"Faze-me ouvir de manhã a tua bondade, pois em ti eu confio." (Salmo 143, 8)</p>`,
      ),
      c(
        'oracao',
        `<h2>Oração</h2>
        <p class="scripture">Bom dia, Senhor. Antes da pressa, eu paro e te entrego essas horas. Caminha comigo hoje, no fácil e no difícil. Amém.</p>`,
      ),
    ],
    faq: [
      {
        question: 'Por que fazer um devocional de manhã?',
        answer:
          'Porque os primeiros minutos influenciam o resto do dia. Começar com gratidão e calma ajuda a atravessar a correria com mais paz.',
      },
      {
        question: 'Preciso acordar mais cedo pra isso?',
        answer:
          'Não. Bastam dois minutos antes de pegar o celular. O que importa é a intenção, não o relógio.',
      },
    ],
  },
  {
    slug: 'devocional-confiar-quando-falta-dinheiro',
    kind: 'devotional',
    intent: 'finances',
    topicSlug: 'financas-e-trabalho',
    relatedIntents: ['anxiety', 'hope', 'faith'],
    title: 'Confiar quando falta dinheiro: devocional sobre o pão de cada dia',
    answer:
      'O medo de não dar conta das contas tira o sono de muita gente. Este devocional parte do "pão nosso de cada dia" pra falar de confiança que anda junto com atitude, um dia de cada vez.',
    summary:
      'Devocional sobre dificuldade financeira: uma reflexão sobre o pão de cada dia, um versículo e uma oração por provisão e paz.',
    chunks: [
      c(
        'reflexao',
        `<h2>Reflexão</h2>
        <p>Quando o dinheiro aperta, o medo costuma falar mais alto que a fé. A cabeça projeta o pior, e o pior ainda nem chegou. Repare que, na oração que Jesus ensinou, o pedido é pelo pão "de cada dia", não pelo estoque do ano inteiro. É confiança pra hoje.</p>
        <p>Isso não é desculpa pra não agir. É o contrário: com a cabeça mais calma, dá pra pensar melhor, organizar, pedir ajuda, buscar trabalho. A fé tira o desespero do volante pra que a sabedoria possa dirigir.</p>`,
      ),
      c(
        'versiculo',
        `<h2>O versículo de hoje</h2>
        <p class="scripture">"O pão nosso de cada dia nos dai hoje." (Mateus 6, 11)</p>`,
      ),
      c(
        'oracao',
        `<h2>Oração</h2>
        <p class="scripture">Senhor, hoje eu peço o pão de hoje e a calma pra cuidar dele. Tira a vergonha e o medo, e me dá clareza pro próximo passo. Eu confio que não vou faltar diante de ti. Amém.</p>`,
      ),
    ],
    faq: [
      {
        question: 'O que a fé tem a ver com dificuldade financeira?',
        answer:
          'A fé não paga a conta, mas devolve a paz pra pensar e a coragem pra agir. Muita decisão ruim com dinheiro nasce do desespero, não da falta de opção.',
      },
      {
        question: 'O que fazer depois de rezar pelas finanças?',
        answer:
          'Dar um passo concreto: anotar o que entra e sai, conversar sobre uma dívida, procurar trabalho ou pedir orientação. Oração e atitude caminham juntas.',
      },
    ],
  },
  {
    slug: 'devocional-a-esperanca-que-nao-decepciona',
    kind: 'devotional',
    intent: 'hope',
    topicSlug: 'esperanca',
    relatedIntents: ['faith', 'grief', 'healing'],
    title: 'A esperança que não decepciona: devocional pra dias sem luz',
    answer:
      'Tem dias em que falta luz no fim do túnel. Este devocional fala de uma esperança que não é otimismo ingênuo, é confiança que sustenta enquanto a resposta não vem.',
    summary:
      'Devocional sobre esperança nos dias difíceis: uma reflexão, um versículo de Romanos e uma oração pra continuar confiando.',
    chunks: [
      c(
        'reflexao',
        `<h2>Reflexão</h2>
        <p>Esperança não é fingir que está tudo bem. É continuar de pé acreditando que a história ainda não acabou. Tem diferença entre o otimismo que ignora a dor e a esperança que olha pra dor de frente e ainda assim confia.</p>
        <p>Nos dias sem luz, esperar vira um ato de coragem. Você não precisa enxergar o fim do caminho pra dar o próximo passo. Só precisa confiar que existe um.</p>`,
      ),
      c(
        'versiculo',
        `<h2>O versículo de hoje</h2>
        <p class="scripture">"E a esperança não decepciona, porque o amor de Deus foi derramado em nossos corações." (Romanos 5, 5)</p>`,
      ),
      c(
        'oracao',
        `<h2>Oração</h2>
        <p class="scripture">Senhor, quando falta luz, sustenta a minha esperança. Eu não consigo ver o fim, mas eu escolho confiar que tu já estás lá. Me dá forças pra esperar sem desistir. Amém.</p>`,
      ),
    ],
    faq: [
      {
        question: 'Qual a diferença entre esperança e otimismo?',
        answer:
          'O otimismo aposta que tudo vai dar certo. A esperança cristã confia em Deus mesmo sem garantia de como as coisas vão terminar. Ela sustenta inclusive quando a notícia é difícil.',
      },
      {
        question: 'Como manter a esperança em momentos difíceis?',
        answer:
          'Um dia de cada vez, dividindo o peso com alguém de confiança e voltando à oração mesmo quando ela parece seca. Esperar também é uma forma de fé.',
      },
    ],
  },
  {
    slug: 'devocional-dormir-entregando-o-dia',
    kind: 'devotional',
    intent: 'sleep',
    topicSlug: 'oracoes-da-noite',
    relatedIntents: ['anxiety', 'night', 'protection'],
    title: 'Dormir entregando o dia: devocional pra noite',
    answer:
      'Antes de dormir, a cabeça insiste em reprisar o dia e adiantar o de amanhã. Este devocional ajuda a fechar o dia com o Salmo 4, entregando o que ficou e descansando de verdade.',
    summary:
      'Devocional de fim de dia: uma reflexão sobre soltar o que ficou pendente, um versículo do Salmo 4 e uma oração de entrega.',
    chunks: [
      c(
        'reflexao',
        `<h2>Reflexão</h2>
        <p>A cama é onde muita gente trava. Apaga a luz e a cabeça liga: o que ficou pra trás, o que vem amanhã, o que foi dito, o que faltou dizer. Dormir bem começa antes, com um gesto de entrega.</p>
        <p>O Salmo 4 tem uma frase linda pra isso: a pessoa deita e dorme em paz porque sabe que não está sozinha guardando a própria vida. Hoje, entregue o que ficou pendente. Amanhã você pega de volta. Agora é hora de descansar.</p>`,
      ),
      c(
        'versiculo',
        `<h2>O versículo de hoje</h2>
        <p class="scripture">"Em paz me deito e logo adormeço, porque só tu, Senhor, me fazes repousar seguro." (Salmo 4, 8)</p>`,
      ),
      c(
        'oracao',
        `<h2>Oração</h2>
        <p class="scripture">Senhor, eu solto o dia que passou e o que ainda não chegou. Tu ficas de guarda enquanto eu durmo. Me devolve descansado amanhã. Amém.</p>`,
      ),
    ],
    faq: [
      {
        question: 'O que fazer quando não consigo dormir de tanto pensar?',
        answer:
          'Antes de deitar, faça um gesto de entrega: escreva ou reze o que está na cabeça e deixe isso pro amanhã. Repetir uma frase curta também ajuda a desacelerar.',
      },
      {
        question: 'Qual salmo rezar antes de dormir?',
        answer:
          'O Salmo 4, com seu "em paz me deito e logo adormeço", e o Salmo 91 são dois dos mais rezados pra noite.',
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* REFLEXÕES                                                           */
/* ------------------------------------------------------------------ */

const REFLECTIONS = [
  {
    slug: 'reflexao-gratidao-no-simples',
    kind: 'reflection',
    intent: 'gratitude',
    topicSlug: 'gratidao',
    relatedIntents: ['faith', 'morning', 'hope'],
    title: 'Gratidão no simples: reparar no que já existe de bom',
    answer:
      'A gente costuma esperar coisas grandes pra agradecer e esquece do que já está aqui. Esta reflexão é um convite a reparar no simples: o café, a conversa, o problema que não aconteceu.',
    summary:
      'Uma reflexão curta sobre gratidão no cotidiano e como ela muda o foco do que falta pro que já temos.',
    chunks: [
      c(
        'texto',
        `<h2>Reparar no que já existe</h2>
        <p>A gratidude tem um problema de marketing: a gente acha que ela é pra momentos grandes, uma conquista, uma cura, uma boa notícia. Mas a maior parte da vida acontece no simples, e é aí que mora quase todo o bem que recebemos.</p>
        <p>Um gole de água quando se tem sede. Alguém que liga só pra saber como você está. A cama no fim de um dia longo. Nada disso é pouco. A gente é que se acostuma e para de ver.</p>
        <p>Agradecer no simples não nega o que está difícil. Só impede que o difícil ocupe toda a tela. Hoje, antes de dormir, lembre de três coisas pequenas e boas. Você vai ver que é mais do que parecia.</p>`,
      ),
    ],
    faq: [
      {
        question: 'Como praticar a gratidão no dia a dia?',
        answer:
          'Escolha um momento fixo, como antes de dormir, pra lembrar de três coisas boas do dia. Com o tempo, você passa a reparar nelas enquanto acontecem.',
      },
    ],
  },
  {
    slug: 'reflexao-fe-no-escuro',
    kind: 'reflection',
    intent: 'faith',
    topicSlug: 'esperanca',
    relatedIntents: ['hope', 'fear', 'grief'],
    title: 'Fé no escuro: confiar mesmo sem enxergar o caminho',
    answer:
      'Fé fácil é fé de dia claro. A difícil é a do escuro, quando a oração parece sem resposta. Esta reflexão fala de continuar confiando mesmo quando não dá pra ver o próximo passo.',
    summary:
      'Uma reflexão sobre a fé que persiste nos momentos de silêncio e dúvida, quando confiar é mais escolha do que sentimento.',
    chunks: [
      c(
        'texto',
        `<h2>Quando a oração parece sem resposta</h2>
        <p>Existe uma fé de dia claro, aquela que é fácil quando tudo vai bem. E existe a fé do escuro, quando você reza e parece que ninguém ouve, quando a resposta demora e a dúvida cresce. Essa segunda é a que sustenta de verdade.</p>
        <p>No escuro, a fé deixa de ser um sentimento bom e vira uma escolha: continuar confiando mesmo sem provas, dar o próximo passo mesmo sem ver o caminho inteiro. Não é teimosia, é confiança em quem caminha junto, mesmo invisível.</p>
        <p>Se você está num desses dias, saiba que silêncio não é ausência. Muita coisa cresce no escuro antes de aparecer na luz, inclusive a sua fé.</p>`,
      ),
    ],
    faq: [
      {
        question: 'O que fazer quando sinto que Deus está em silêncio?',
        answer:
          'Continue rezando com sinceridade, mesmo que pareça seco, e divida o peso com alguém de confiança. Silêncio nem sempre é ausência. Às vezes é tempo de espera.',
      },
    ],
  },
  {
    slug: 'reflexao-luto-e-saudade',
    kind: 'reflection',
    intent: 'grief',
    topicSlug: 'luto-e-consolo',
    relatedIntents: ['hope', 'faith', 'healing'],
    title: 'Luto e saudade: dar tempo ao tempo da dor',
    answer:
      'O luto não tem prazo, e ninguém precisa estar bem rápido pra agradar os outros. Esta reflexão acolhe a saudade como parte de quem ama, sem pressa de superar.',
    summary:
      'Uma reflexão sobre o luto e o tempo da dor, lembrando que chorar é parte de amar e que ninguém atravessa sozinho.',
    chunks: [
      c(
        'texto',
        `<h2>A saudade não tem pressa</h2>
        <p>Existe uma cobrança silenciosa pra que a gente "supere logo". As pessoas, sem querer, esperam que você volte ao normal num prazo curto. Mas o luto não funciona assim. Ele vem em ondas, melhora e piora, e não obedece calendário.</p>
        <p>Chorar não é falta de fé. É parte de ter amado. A saudade é o preço justo de ter tido alguém que valeu a pena. Não tente apagar isso, e não se cobre por sentir.</p>
        <p>A fé não tira a falta, mas oferece companhia pra atravessar e a esperança de um reencontro. Vá no seu tempo. E quando a dor pesar demais, não carregue sozinho: fale com alguém, busque apoio. Pedir ajuda também é cuidar de quem ficou.</p>`,
      ),
    ],
    faq: [
      {
        question: 'Quanto tempo dura o luto?',
        answer:
          'Não há tempo certo. Ele vem em ondas e cada pessoa vive no seu ritmo. Se a dor te impede de viver por muito tempo, procurar apoio de um profissional ajuda.',
      },
    ],
  },
  {
    slug: 'reflexao-trabalho-e-proposito',
    kind: 'reflection',
    intent: 'finances',
    topicSlug: 'financas-e-trabalho',
    relatedIntents: ['hope', 'faith', 'gratitude'],
    title: 'Trabalho e propósito: o seu valor não está no salário',
    answer:
      'Numa época que mede tudo por produtividade, é fácil confundir o que você ganha com o que você vale. Esta reflexão separa as duas coisas e fala de trabalho com sentido.',
    summary:
      'Uma reflexão sobre trabalho, dinheiro e dignidade, lembrando que o valor de uma pessoa não cabe num salário.',
    chunks: [
      c(
        'texto',
        `<h2>Você vale mais que um salário</h2>
        <p>O trabalho ocupa boa parte da vida, e é natural que mexa com a autoestima. Mas tem uma armadilha aí: começar a medir o próprio valor pelo cargo, pelo salário, pelo quanto se produz. Quando o trabalho vai mal, parece que a pessoa inteira vale menos. E isso não é verdade.</p>
        <p>Na fé, a dignidade vem antes de qualquer função. Você é amado por existir, não pelo que entrega. Isso não diminui a importância do trabalho, dá a ele o lugar certo: uma parte da vida, não a medida de tudo.</p>
        <p>Se você está desempregado ou num momento difícil de carreira, isso não te define. Cuide do que dá pra cuidar, peça ajuda sem vergonha e lembre todos os dias: o seu valor não está na conta bancária.</p>`,
      ),
    ],
    faq: [
      {
        question: 'Como lidar com o desemprego sem perder a fé?',
        answer:
          'Separe o seu valor do seu emprego, mantenha uma rotina, dê passos concretos na busca e divida o peso com quem confia. A fé sustenta a esperança enquanto a porta não se abre.',
      },
    ],
  },
  {
    slug: 'reflexao-cura-do-corpo-e-da-alma',
    kind: 'reflection',
    intent: 'healing',
    topicSlug: 'cura',
    relatedIntents: ['faith', 'hope', 'family'],
    title: 'Cura do corpo e da alma: esperar sem desistir do cuidado',
    answer:
      'Nem toda cura é rápida, e algumas vêm por dentro antes de virem por fora. Esta reflexão fala de confiar no processo, cuidar do corpo e deixar Deus cuidar da alma.',
    summary:
      'Uma reflexão sobre cura e paciência: a saúde do corpo, o descanso da alma e a esperança que sustenta o tratamento.',
    chunks: [
      c(
        'texto',
        `<h2>Cura também é processo</h2>
        <p>A gente quer cura instantânea, e às vezes ela não vem assim. Tratamentos longos, recuperações lentas, dias melhores e piores. Nesse meio tempo, é fácil perder a esperança e a paciência.</p>
        <p>Existe a cura do corpo, que a medicina ajuda a buscar, e existe a cura da alma, que muitas vezes acontece em paralelo: a paz que volta, o medo que diminui, a capacidade de viver bem mesmo com o que não mudou. As duas importam.</p>
        <p>Cuidar do corpo é também uma oração: seguir o tratamento, descansar, aceitar ajuda. E enquanto a melhora vem, deixe Deus cuidar da parte de dentro. Você não precisa ser forte o tempo todo. Só precisa não soltar a mão de quem caminha com você.</p>`,
      ),
    ],
    faq: [
      {
        question: 'Como manter a fé durante um tratamento longo?',
        answer:
          'Um dia de cada vez, cuidando do corpo com os recursos da medicina e da alma com oração e apoio. Esperar a melhora sem desistir do cuidado também é fé.',
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* TÓPICOS e ENTIDADES                                                 */
/* ------------------------------------------------------------------ */

const TOPIC_DEFS = [
  ['salmos-de-protecao', 'Salmos de proteção', 'protection', 'Salmos que pedem guarda e refúgio, como o 91 e o 121, pra rezar em momentos de medo ou na proteção da casa.'],
  ['salmos-de-confianca', 'Salmos de confiança', 'faith', 'Salmos que renovam a fé e acalmam o coração, como o 23, o 27 e o 139.'],
  ['oracoes-da-noite', 'Orações da noite', 'night', 'Orações pra encerrar o dia, agradecer e dormir em paz.'],
  ['oracoes-da-manha', 'Orações da manhã', 'morning', 'Orações pra começar o dia com gratidão e entrega.'],
  ['oracoes-aos-santos', 'Orações aos santos', 'hope', 'Orações de intercessão, como a Santo Judas Tadeu, das causas difíceis.'],
  ['ansiedade-e-paz', 'Ansiedade e paz', 'anxiety', 'Orações e devocionais pra acalmar a ansiedade e o medo, um passo de cada vez.'],
  ['financas-e-trabalho', 'Finanças e trabalho', 'finances', 'Orações e reflexões pra tempos de aperto financeiro e questões de trabalho, com fé e atitude.'],
  ['familia', 'Família', 'family', 'Orações pela casa, pelos filhos e pela união da família.'],
  ['luto-e-consolo', 'Luto e consolo', 'grief', 'Orações e reflexões pra atravessar a perda e a saudade com amparo.'],
  ['cura', 'Cura', 'healing', 'Orações e reflexões pela saúde do corpo e da alma.'],
  ['perdao', 'Perdão', 'forgiveness', 'Orações e salmos pra pedir e oferecer perdão, e soltar o peso da mágoa.'],
  ['gratidao', 'Gratidão', 'gratitude', 'Orações e reflexões pra agradecer e reparar no que já existe de bom.'],
  ['esperanca', 'Esperança', 'hope', 'Reflexões e devocionais pra renovar a esperança nos dias sem luz.'],
  ['oracoes-essenciais', 'Orações essenciais', 'faith', 'As orações que todo cristão conhece, como o Pai Nosso e a Oração da Serenidade.'],
];

const TOPICS = TOPIC_DEFS.map(([slug, name, intent, description]) => ({
  id: slug,
  slug,
  name,
  intent,
  description,
  answer: description,
  bodyHtml: `<p>${description}</p>`,
  relatedTopicSlugs: [],
  heroImageUrl: null,
  lang: 'pt-BR',
}));

const ENTITIES = [];

/* ------------------------------------------------------------------ */
/* EXPORTS                                                             */
/* ------------------------------------------------------------------ */

export const SIGNALS = [...PSALMS, ...PRAYERS, ...DEVOTIONALS, ...REFLECTIONS].map(mk);
export const TOPIC_LIST = TOPICS;
export const ENTITY_LIST = ENTITIES;
