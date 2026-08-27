/**
 * PAUTA: conteúdos aprovados que ainda não foram escritos.
 *
 * Cada item aparece no hub da sua seção como card "Em breve" (sem link, pra não
 * criar 404 nem página fina indexada) e não entra no sitemap. Quando o conteúdo
 * de verdade for publicado em content/signals/ com o mesmo slug, o card vira
 * automaticamente o card real: basta apagar a linha daqui.
 *
 * Os números vêm da pesquisa no Ubersuggest (Brasil, pt-BR, ago/2026):
 *   volume = buscas/mês   sd = dificuldade de SEO (0 a 100, menor é melhor)
 *
 * Regra de ouro contra canibalização: um slug por intenção de busca. Variações
 * quase idênticas ("nomes bíblicos masculino" e "masculinos") moram na MESMA
 * página, nunca em duas.
 */

export const ROADMAP = [
  // ---------- Nomes bíblicos ----------
  {
    slug: 'nomes-de-menino',
    section: 'nomes-biblicos',
    title: 'Nomes bíblicos de menino',
    note: 'Lista com significado, origem e como se escreve.',
    keyword: 'nomes bíblicos de menino',
    volume: 33100,
    sd: 17,
  },
  {
    slug: 'nomes-femininos',
    section: 'nomes-biblicos',
    title: 'Nomes bíblicos femininos',
    note: 'Nomes de mulher na Bíblia e o que cada um significa.',
    keyword: 'nomes bíblicos femininos',
    volume: 18100,
    sd: 16,
  },
  {
    slug: 'nomes-de-menina',
    section: 'nomes-biblicos',
    title: 'Nomes bíblicos de menina',
    note: 'Sugestões de nome com o sentido de cada um.',
    keyword: 'nomes bíblicos de menina',
    volume: 14800,
    sd: 21,
  },
  {
    slug: 'nomes-masculinos',
    section: 'nomes-biblicos',
    title: 'Nomes bíblicos masculinos',
    note: 'Lista completa de nomes de homem na Bíblia.',
    keyword: 'nomes bíblicos masculinos',
    volume: 14800,
    sd: 20,
  },
  {
    slug: 'nomes-raros',
    section: 'nomes-biblicos',
    title: 'Nomes bíblicos raros',
    note: 'Nomes pouco usados, com significado forte.',
    keyword: 'nomes bíblicos raros',
    volume: 3600,
    sd: 24,
  },

  // ---------- Livros da Bíblia ----------
  {
    slug: 'ordem-dos-livros',
    section: 'livros-da-biblia',
    title: 'A ordem dos livros da Bíblia',
    note: 'Os 66 livros na sequência certa, do Gênesis ao Apocalipse.',
    keyword: 'ordem dos livros da bíblia',
    volume: 6600,
    sd: 7,
  },
  {
    slug: 'todos-os-livros',
    section: 'livros-da-biblia',
    title: 'Todos os livros da Bíblia',
    note: 'Lista completa com quantos capítulos tem cada um.',
    keyword: 'todos os livros da bíblia',
    volume: 4400,
    sd: 7,
  },
  {
    slug: 'divisao-dos-livros',
    section: 'livros-da-biblia',
    title: 'A divisão dos livros da Bíblia',
    note: 'Lei, história, poesia, profetas, evangelhos e cartas.',
    keyword: 'divisão dos livros da bíblia',
    volume: 1900,
    sd: 18,
  },
  {
    slug: 'abreviaturas',
    section: 'livros-da-biblia',
    title: 'Abreviaturas dos livros da Bíblia',
    note: 'Tabela pra entender as siglas das citações.',
    keyword: 'abreviatura dos livros da bíblia',
    volume: 1300,
    sd: 15,
  },

  // ---------- Personagens bíblicos ----------
  {
    slug: 'quem-e-quem',
    section: 'personagens-biblicos',
    title: 'Personagens bíblicos: quem é quem',
    note: 'Guia dos principais nomes do Antigo e do Novo Testamento.',
    keyword: 'personagens bíblicos',
    volume: 8100,
    sd: 19,
  },
  {
    slug: 'mulheres-da-biblia',
    section: 'personagens-biblicos',
    title: 'Mulheres da Bíblia',
    note: 'A história delas e o que cada uma tem a ensinar.',
    keyword: 'personagens bíblicos femininos',
    volume: 1000,
    sd: 28,
  },

  // ---------- Provérbios ----------
  {
    slug: '16-3',
    section: 'proverbios',
    title: 'Provérbios 16:3',
    note: '"Confia ao Senhor as tuas obras": o que isso pede de você.',
    keyword: 'provérbios 16 3',
    volume: 90500,
    sd: 32,
  },
  {
    slug: '31-10',
    section: 'proverbios',
    title: 'Provérbios 31:10',
    note: 'A mulher virtuosa: o texto e o que ele realmente diz.',
    keyword: 'provérbios 31 10',
    volume: 40500,
    sd: 27,
  },
  {
    slug: '18-22',
    section: 'proverbios',
    title: 'Provérbios 18:22',
    note: '"Quem acha uma esposa acha o bem": sentido e contexto.',
    keyword: 'provérbios 18 22',
    volume: 40500,
    sd: 26,
  },
  {
    slug: '4-23',
    section: 'proverbios',
    title: 'Provérbios 4:23',
    note: 'Guardar o coração: o que a Bíblia quer dizer com isso.',
    keyword: 'provérbios 4 23',
    volume: 33100,
    sd: 25,
  },
  {
    slug: '19-21',
    section: 'proverbios',
    title: 'Provérbios 19:21',
    note: 'Os planos do homem e o propósito de Deus.',
    keyword: 'provérbios 19 21',
    volume: 27100,
    sd: 27,
  },
  {
    slug: '31-6',
    section: 'proverbios',
    title: 'Provérbios 31:6',
    note: 'Um versículo muito citado e pouco entendido.',
    keyword: 'provérbios 31 6',
    volume: 22200,
    sd: 23,
  },
  {
    slug: '18-21',
    section: 'proverbios',
    title: 'Provérbios 18:21',
    note: 'O poder da língua: vida e morte no que a gente fala.',
    keyword: 'provérbios 18 21',
    volume: 22200,
    sd: 20,
  },
  {
    slug: '27-9',
    section: 'proverbios',
    title: 'Provérbios 27:9',
    note: 'Sobre amizade verdadeira e conselho sincero.',
    keyword: 'provérbios 27 9',
    volume: 18100,
    sd: 24,
  },
  {
    slug: '13-20',
    section: 'proverbios',
    title: 'Provérbios 13:20',
    note: 'Quem anda com sábios: a companhia que forma a gente.',
    keyword: 'provérbios 13 20',
    volume: 14800,
    sd: 17,
  },

  // ---------- Estudos bíblicos ----------
  {
    slug: 'frutos-do-espirito-santo',
    section: 'estudo',
    title: 'Os frutos do Espírito Santo',
    note: 'Os nove frutos, um por um, com o versículo de origem.',
    keyword: 'frutos do espírito santo',
    volume: 14800,
    sd: 15,
  },
  {
    slug: 'dons-espirituais',
    section: 'estudo',
    title: 'Os dons espirituais',
    note: 'Quais são, onde estão na Bíblia e pra que servem.',
    keyword: 'dons espirituais',
    volume: 5400,
    sd: 13,
  },
  {
    slug: 'oracao',
    section: 'estudo',
    title: 'Estudo bíblico sobre oração',
    note: 'O que a Bíblia ensina sobre orar, e como começar.',
    keyword: 'estudo bíblico sobre oração',
    volume: 1300,
    sd: 14,
  },
  {
    slug: 'familia',
    section: 'estudo',
    title: 'Estudo bíblico sobre família',
    note: 'A casa como projeto de Deus, com texto e aplicação.',
    keyword: 'estudo bíblico sobre família',
    volume: 1300,
    sd: 12,
  },

  // ---------- Frases e mensagens ----------
  {
    slug: 'biblicas-motivacionais',
    section: 'frases',
    title: 'Frases bíblicas motivacionais',
    note: 'Versículos pra levantar quando o dia pesa.',
    keyword: 'frases bíblicas motivacionais',
    volume: 12100,
    sd: 26,
  },
  {
    slug: 'fe-e-motivacao',
    section: 'frases',
    title: 'Frases de fé e motivação',
    note: 'Pra recomeçar a semana com o coração firme.',
    keyword: 'frases de fé e motivação',
    volume: 9900,
    sd: 21,
  },
  {
    slug: 'mensagem-de-otimismo',
    section: 'frases',
    title: 'Mensagens de fé e otimismo',
    note: 'Textos curtos pra mandar pra quem precisa ouvir.',
    keyword: 'mensagem de fé otimismo',
    volume: 8100,
    sd: 15,
  },
  {
    slug: 'fe-e-forca',
    section: 'frases',
    title: 'Frases de fé e força',
    note: 'Pra momentos de luta, doença e cansaço.',
    keyword: 'frases de fé e força',
    volume: 5400,
    sd: 20,
  },
  {
    slug: 'fe-e-confianca',
    section: 'frases',
    title: 'Frases de fé e confiança em Deus',
    note: 'Quando falta certeza e sobra pergunta.',
    keyword: 'frases de fé e confiança',
    volume: 5400,
    sd: 22,
  },
  {
    slug: 'votos-de-casamento',
    section: 'frases',
    title: 'Votos de casamento cristãos',
    note: 'Modelos prontos e como escrever os seus.',
    keyword: 'votos de casamento',
    volume: 12100,
    sd: 12,
  },
];

/** Itens da pauta de uma seção, do maior volume pro menor. */
export const roadmapForSection = (sectionSlug) =>
  ROADMAP.filter((item) => item.section === sectionSlug).sort((a, b) => b.volume - a.volume);

/** Quantos conteúdos ainda faltam escrever numa seção. */
export const plannedCount = (sectionSlug) => roadmapForSection(sectionSlug).length;
