/**
 * Pilar "Blog / Vida com Fé": artigos mais longos de ajuda prática.
 *
 * É o conteúdo de apoio à vida real (família, casamento, superação, vida
 * cristã, finanças), com base bíblica, sem moralismo. Cada artigo vive em
 * /blog/<slug> e é agrupado por categoria na página /blog.
 *
 * Regras de edição (iguais ao resto do site):
 *   - Português do Brasil, caloroso e direto, conversa de gente pra gente.
 *   - Sem travessão. Vírgula, ponto, parênteses ou dois-pontos.
 *   - Answer-first: `excerpt` resolve a busca em 1 a 2 linhas.
 */

const PUB = '2026-05-01T08:00:00.000Z';
const UPD = '2026-05-25T08:00:00.000Z';

export const BLOG_CATEGORIES = [
  { slug: 'familia', label: 'Família', description: 'Casa, filhos, educação e harmonia no lar.' },
  { slug: 'casamento', label: 'Casamento', description: 'Vida a dois, conflitos e companheirismo.' },
  { slug: 'superacao', label: 'Superação', description: 'Ansiedade, medo, luto e recomeços com fé.' },
  { slug: 'vida-crista', label: 'Vida cristã', description: 'Oração, leitura da Bíblia e crescimento espiritual.' },
  { slug: 'financas', label: 'Finanças com fé', description: 'Dívidas, trabalho e provisão sem desespero.' },
];

const POSTS = [
  {
    slug: 'como-vencer-a-ansiedade-com-fe',
    category: 'superacao',
    title: 'Como vencer a ansiedade com fé (sem fingir que está tudo bem)',
    excerpt:
      'Vencer a ansiedade com fé não é ignorar o que você sente. É juntar oração, atitude e, quando preciso, ajuda profissional, pra entregar o que não dá pra controlar e cuidar do que dá.',
    readMins: 6,
    relatedIntent: 'anxiety',
    bodyHtml: `<p>A ansiedade não é falta de fé. Gente de muita fé sente o peito apertar, perde o sono e fica remoendo o amanhã. A Bíblia, aliás, fala tanto disso que tem versículo direto sobre o assunto: "não andeis ansiosos por coisa alguma" (Filipenses 4, 6). Repare que o versículo não para aí. Ele dá um caminho.</p>
    <h2>Troque a preocupação pela oração, não pela negação</h2>
    <p>Filipenses 4, 6 continua: "em tudo, pela oração, apresentai os vossos pedidos a Deus". A proposta não é "pare de sentir", que seria impossível. É trocar a ruminação por entrega. Em vez de rodar o problema mil vezes na cabeça, você coloca ele em palavras e entrega. Rezar aqui é quase um desabafo dirigido: "isso aqui está grande demais pra mim, toma conta".</p>
    <h2>Faça uma coisa concreta de cada vez</h2>
    <p>Ansiedade adora futuro. Ela te leva pra um amanhã que ainda não existe e te prende lá. Jesus devolve o foco pro hoje: "não vos inquieteis com o dia de amanhã" (Mateus 6, 34). Na prática, pergunte: qual é a única próxima coisa que eu posso fazer agora? Responder um e-mail, beber água, dar um passo. O resto espera.</p>
    <h2>Cuide do corpo, ele reza junto</h2>
    <p>Dormir, respirar fundo, caminhar, reduzir o café e a tela antes de dormir. Nada disso é "pouco espiritual". O corpo e a alma andam juntos, e cuidar de um ajuda o outro. Se a ansiedade está tomando conta da sua vida, procurar um médico ou um psicólogo é um ato de sabedoria, não de fraqueza. Fé e tratamento não competem, se somam.</p>
    <h2>Uma rotina simples pros dias difíceis</h2>
    <p>Ao acordar, leia um versículo só, devagar. Diga em voz alta uma coisa pela qual você é grato. Faça três respirações longas. E entregue o dia: "hoje eu faço a minha parte, o resto eu deixo contigo". Repita amanhã. A paz costuma voltar aos poucos, não de uma vez.</p>`,
    faq: [
      {
        question: 'A ansiedade é falta de fé?',
        answer:
          'Não. Pessoas de muita fé também sentem ansiedade. A fé não elimina o sentimento, mas oferece um caminho pra atravessar: entregar a Deus o que não se controla e cuidar do que se pode.',
      },
      {
        question: 'Qual versículo ajuda contra a ansiedade?',
        answer:
          'Filipenses 4, 6-7 e 1 Pedro 5, 7 ("lançai sobre ele toda a vossa ansiedade") são os mais lembrados. Veja mais em nossa página de versículos sobre ansiedade.',
      },
      {
        question: 'Posso ter fé e fazer terapia ao mesmo tempo?',
        answer:
          'Sim. Procurar um psicólogo ou médico é um ato de cuidado e sabedoria. Fé e tratamento caminham lado a lado, não em oposição.',
      },
    ],
  },
  {
    slug: 'como-ler-a-biblia-do-zero',
    category: 'vida-crista',
    title: 'Como ler a Bíblia do zero: um guia simples pra começar',
    excerpt:
      'Pra começar a ler a Bíblia, não comece do Gênesis tentando ler tudo. Comece por um Evangelho, leia poucos versículos por dia e use um plano simples. O importante é a constância, não a velocidade.',
    readMins: 7,
    relatedIntent: 'faith',
    bodyHtml: `<p>Muita gente abre a Bíblia no Gênesis, anima no começo, empaca em Levítico e desiste. É normal. A Bíblia não foi feita pra ser lida de capa a capa como um romance. Dá pra começar de um jeito muito mais leve.</p>
    <h2>Comece por um Evangelho</h2>
    <p>O melhor ponto de partida é um dos Evangelhos, e o de João ou o de Marcos são ótimos primeiros. Ali você encontra Jesus falando e agindo, que é o coração de tudo. Depois dá pra ir pros Salmos (oração pura) e pra Provérbios (sabedoria do dia a dia).</p>
    <h2>Pouco por dia, todo dia</h2>
    <p>Dez minutos valem mais que duas horas uma vez por mês. Leia um trecho curto, dez a quinze versículos, e pare pra pensar. Constância ganha de quantidade. Escolha um horário fixo, de manhã ou antes de dormir, e deixe a Bíblia num lugar visível.</p>
    <h2>Leia com três perguntas</h2>
    <p>Pra não passar os olhos sem absorver, pergunte a cada trecho: o que esse texto diz sobre Deus? O que ele diz sobre as pessoas? E o que muda na minha vida hoje? Anote uma frase que te tocou. Você vai se surpreender com o quanto fica.</p>
    <h2>Use uma tradução que você entende</h2>
    <p>Existem traduções mais literais e outras mais fáceis de ler. Pra começar, escolha uma em linguagem atual, que não te trave. Você sempre pode comparar versões depois. O objetivo no início é entender, não decorar.</p>
    <h2>Não leia sozinho o tempo todo</h2>
    <p>Ler com outras pessoas ajuda muito: um grupo, a família, um amigo. E quando travar num trecho difícil, tudo bem pular e voltar depois. A Bíblia se ilumina aos poucos, com o tempo e a caminhada.</p>`,
    faq: [
      {
        question: 'Por onde começar a ler a Bíblia?',
        answer:
          'Por um Evangelho, como João ou Marcos, e não pelo Gênesis tentando ler tudo. Depois siga pros Salmos e Provérbios.',
      },
      {
        question: 'Quanto tempo por dia devo ler?',
        answer:
          'Dez a quinze minutos por dia, com constância, rendem mais que leituras longas e esporádicas. O segredo é o hábito.',
      },
      {
        question: 'Qual a melhor tradução pra iniciantes?',
        answer:
          'Uma tradução em linguagem atual, que você entenda sem esforço. Dá pra comparar com versões mais literais depois que pegar o ritmo.',
      },
    ],
  },
  {
    slug: 'como-fortalecer-o-casamento-com-fe',
    category: 'casamento',
    title: 'Como fortalecer o casamento com fé e pequenos hábitos',
    excerpt:
      'Casamento forte não se faz de grandes gestos, e sim de pequenos hábitos repetidos: escutar, perdoar rápido, orar juntos e cuidar do "nós". A fé entra como o terceiro fio que segura a corda.',
    readMins: 6,
    relatedIntent: 'family',
    bodyHtml: `<p>Eclesiastes diz que "o cordão de três dobras não se rompe com facilidade" (4, 12). No casamento, esse terceiro fio é Deus no meio dos dois. Mas fé no casamento não é só rezar, é deixar a fé virar atitude no dia a dia.</p>
    <h2>Perdão rápido, mágoa curta</h2>
    <p>"Não se ponha o sol sobre a vossa ira" (Efésios 4, 26). Mágoa guardada vira parede. Casais que duram não são os que nunca brigam, são os que reconciliam rápido. Aprenda a dizer "me desculpa" e "eu errei" sem que isso custe o seu orgulho inteiro.</p>
    <h2>Escutar é um ato de amor</h2>
    <p>Muita briga não é sobre o assunto, é sobre não se sentir ouvido. Antes de responder, repita com suas palavras o que o outro disse. Parece bobo, mas desarma. O amor de 1 Coríntios 13 é "paciente" justamente porque escutar exige paciência.</p>
    <h2>Orem juntos, mesmo que curtinho</h2>
    <p>Não precisa de oração longa nem bonita. Antes de dormir, de mãos dadas, cada um agradece uma coisa e pede uma. Isso cria intimidade espiritual e lembra os dois de que estão do mesmo lado, não em lados opostos.</p>
    <h2>Cuide do "nós", não só da casa</h2>
    <p>Contas, filhos e trabalho engolem o casal. Reserve um tempo só de vocês dois, mesmo que seja um café sem celular. Relacionamento é como planta: morre de falta de água, não de excesso de problema.</p>
    <h2>Quando está difícil de verdade</h2>
    <p>Tem fases que pedem ajuda de fora: um padre, um pastor, um terapeuta de casais. Buscar ajuda não é fracasso, é levar o casamento a sério. E continue rezando um pelo outro, principalmente nos dias em que está difícil de gostar.</p>`,
    faq: [
      {
        question: 'O que a Bíblia diz sobre fortalecer o casamento?',
        answer:
          'Que o amor é paciente e perdoa (1 Coríntios 13), que os dois são uma só carne (Gênesis 2, 24) e que a união com Deus no centro resiste mais (Eclesiastes 4, 12).',
      },
      {
        question: 'Como orar pelo casamento?',
        answer:
          'Orem juntos, mesmo que curtinho: de mãos dadas, antes de dormir, cada um agradece e pede uma coisa. E reze pelo seu cônjuge mesmo nos dias de conflito.',
      },
    ],
  },
  {
    slug: 'criar-os-filhos-na-fe',
    category: 'familia',
    title: 'Como criar os filhos na fé sem precisar ser o pai perfeito',
    excerpt:
      'Criar os filhos na fé é menos sobre regras e mais sobre exemplo, presença e conversa. Você não precisa ter todas as respostas, só precisa caminhar junto e deixar a fé ser parte natural da casa.',
    readMins: 6,
    relatedIntent: 'family',
    bodyHtml: `<p>"Ensina a criança no caminho em que deve andar" (Provérbios 22, 6). A palavra-chave aqui é "ensina", e o melhor ensino não é discurso, é exemplo. Filho aprende mais vendo do que ouvindo. A boa notícia: você não precisa ser perfeito, precisa ser verdadeiro.</p>
    <h2>Fé se mostra mais do que se explica</h2>
    <p>Quando você agradece pela comida, reza num momento difícil ou perdoa alguém na frente deles, está ensinando mais do que qualquer sermão. As crianças captam o clima da casa. Uma fé leve e real gruda mais que uma fé cobrada.</p>
    <h2>Crie pequenos ritos</h2>
    <p>Uma oração antes de dormir, agradecer à mesa, um versículo na geladeira. Ritos simples dão segurança e viram memória afetiva. Não precisa ser solene. Pode ser do jeito da sua família, com as palavras de vocês.</p>
    <h2>Deixe espaço pras perguntas</h2>
    <p>Filhos vão duvidar, questionar e às vezes recusar. Tudo bem. Fé imposta costuma virar revolta. Acolha a pergunta sem se desesperar. "Não sei, vamos pensar juntos" é uma resposta de fé madura, não de fraqueza.</p>
    <h2>Reze por eles, todo dia</h2>
    <p>Mais do que controlar, a gente aprende a entregar. Reze pelo nome de cada filho, peça proteção e bom caminho, principalmente quando eles já estão longe do seu alcance. O amor que reza não desiste.</p>`,
    faq: [
      {
        question: 'Como ensinar a fé aos filhos?',
        answer:
          'Principalmente pelo exemplo e por pequenos ritos: orar antes de dormir, agradecer à mesa, perdoar na frente deles. Exemplo ensina mais que discurso.',
      },
      {
        question: 'E se o meu filho não quiser saber de Deus?',
        answer:
          'Acolha a dúvida sem se desesperar. Fé imposta vira revolta. Continue dando o exemplo, mantenha a conversa aberta e reze por ele. Cada um tem o seu tempo.',
      },
    ],
  },
];

const withDates = (p) => ({ publishedAt: PUB, updatedAt: UPD, ...p });

export const listPosts = () => POSTS.map(withDates);

export const getPost = (slug) => {
  const p = POSTS.find((x) => x.slug === slug);
  return p ? withDates(p) : null;
};

export const listPostsByCategory = (categorySlug) =>
  listPosts().filter((p) => p.category === categorySlug);

export const getCategory = (slug) => BLOG_CATEGORIES.find((c) => c.slug === slug) ?? null;

export const POST_SLUGS = POSTS.map((p) => p.slug);

export const categoryLabel = (slug) => getCategory(slug)?.label ?? slug;
