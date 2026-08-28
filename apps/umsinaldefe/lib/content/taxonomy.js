/**
 * REGISTRO ÚNICO DE SEÇÕES DO SITE.
 *
 * Este arquivo é a fonte da verdade. Derivam dele, sem duplicação:
 *   - menu principal (SiteNav) e mega-menu
 *   - rodapé (SiteFooter)
 *   - sitemap.xml (app/sitemap.js)
 *   - llms.txt e llms-full.txt
 *   - URL de cada conteúdo (lib/content/signal-url.js)
 *   - lista de kinds válidos (lib/content/types.js)
 *   - trilhas de navegação (breadcrumbs) e o mapa do site
 *
 * PARA ADICIONAR UMA SEÇÃO NOVA:
 *   1. adicione um objeto em SECTIONS aqui;
 *   2. crie app/<slug>/page.jsx com 3 linhas (ver app/frases/page.jsx de modelo).
 * Nada mais. Não repita a lista em nenhum outro lugar.
 *
 * Campos:
 *   slug        segmento de URL do hub (/salmo, /frases...)
 *   kind        kind do signal que alimenta a seção (null = hub sem listagem própria)
 *   extraKinds  kinds que também caem nesta seção (usados na URL e no filtro)
 *   slugPrefix  prefixo removido do slug do signal pra montar a URL do item
 *   group       id do NAV_GROUP onde a seção aparece no menu
 *   label       nome curto (menu, rodapé, breadcrumb)
 *   navNote     linha de apoio no mega-menu
 *   title       H1 e <title> do hub
 *   lead        parágrafo de abertura do hub
 *   itemLabel   como chamar um item isolado ("Salmo", "Oração")
 *   glyph       ícone (ver components/Glyph.jsx)
 *   priority    prioridade no sitemap
 *   changeFrequency  frequência no sitemap
 *   inFooter    aparece na coluna do rodapé
 */

export const NAV_GROUPS = [
  { id: 'biblia', label: 'Bíblia', note: 'Ler e entender a Palavra' },
  { id: 'orar', label: 'Orar', note: 'Orações e salmos pra cada momento' },
  { id: 'diario', label: 'Todo dia', note: 'Seu momento com Deus, diário' },
  { id: 'aprender', label: 'Aprender', note: 'Estudos e vida cristã' },
];

export const SECTIONS = [
  // ---------- Bíblia ----------
  {
    slug: 'biblia',
    kind: 'verse_collection',
    slugPrefix: 'biblia-',
    group: 'biblia',
    label: 'Versículos por tema',
    navNote: 'Amor, família, cura, gratidão',
    title: 'Versículos da Bíblia por tema',
    lead: 'A Bíblia tem uma palavra pra cada momento. Reunimos os versículos por tema, pra você achar rápido o que precisa: pra amar, agradecer, ter fé ou acalmar o coração.',
    seoTitle: 'Bíblia: versículos por tema em português',
    seoDescription:
      'Versículos da Bíblia organizados por tema: amor, família, casamento, cura, gratidão, esperança, fé, proteção, perdão e ansiedade. Pra ler, refletir e rezar.',
    itemLabel: 'Tema',
    glyph: 'book',
    priority: 0.9,
    changeFrequency: 'weekly',
    inFooter: true,
  },
  {
    slug: 'livros-da-biblia',
    kind: 'book_guide',
    slugPrefix: 'livro-',
    group: 'biblia',
    label: 'Livros da Bíblia',
    navNote: 'Ordem, divisão e abreviaturas',
    title: 'Os livros da Bíblia',
    // O site é interconfessional: 66 é o cânon protestante, o católico tem 73.
    // Falar em "66 livros" como se fosse o único número exclui metade do público.
    lead: 'Os livros da Bíblia explicados: a ordem certa, a divisão entre Antigo e Novo Testamento, as abreviaturas das citações e a diferença entre a Bíblia católica e a evangélica.',
    itemLabel: 'Livro',
    glyph: 'scroll',
    priority: 0.8,
    changeFrequency: 'monthly',
    inFooter: true,
  },
  {
    slug: 'personagens-biblicos',
    kind: 'character',
    slugPrefix: 'personagem-',
    group: 'biblia',
    label: 'Personagens bíblicos',
    navNote: 'Quem foi quem na Bíblia',
    title: 'Personagens bíblicos',
    lead: 'A história de quem viveu a fé antes de nós: profetas, reis, mulheres e apóstolos, com o que a Bíblia conta de cada um e o que dá pra aprender.',
    itemLabel: 'Personagem',
    glyph: 'people',
    priority: 0.8,
    changeFrequency: 'monthly',
    inFooter: false,
  },
  {
    slug: 'nomes-biblicos',
    kind: 'name_collection',
    slugPrefix: 'nomes-',
    group: 'biblia',
    label: 'Nomes bíblicos',
    navNote: 'Significado, origem e listas',
    title: 'Nomes bíblicos e seus significados',
    lead: 'Listas de nomes bíblicos com significado e origem, pra quem está escolhendo o nome de um filho ou só quer saber o que o próprio nome quer dizer.',
    itemLabel: 'Lista',
    glyph: 'bookmark',
    priority: 0.8,
    changeFrequency: 'monthly',
    inFooter: false,
  },
  {
    slug: 'proverbios',
    kind: 'proverb',
    slugPrefix: 'proverbios-',
    group: 'biblia',
    label: 'Provérbios',
    navNote: 'Sabedoria, versículo por versículo',
    title: 'Provérbios explicados',
    lead: 'O livro de Provérbios versículo por versículo: o que cada um quer dizer, o contexto e como aplicar na vida de hoje sem complicar.',
    itemLabel: 'Provérbio',
    glyph: 'grain',
    priority: 0.8,
    changeFrequency: 'weekly',
    inFooter: false,
  },

  // ---------- Orar ----------
  {
    slug: 'oracao',
    kind: 'prayer',
    // reflexões, versículos avulsos e novenas também moram aqui
    extraKinds: ['reflection', 'verse', 'novena'],
    slugPrefix: 'oracao-',
    group: 'orar',
    label: 'Orações',
    navNote: 'Aos santos e pra cada momento',
    title: 'Orações',
    lead: 'Orações tradicionais e do dia a dia: aos santos, pela família, por proteção, por cura e pra quando falta palavra.',
    seoTitle: 'Orações por intenção e por santos, em português',
    seoDescription:
      'Orações curtas e completas em português, pra ansiedade, sono, proteção, família, fé e muito mais. Inclui orações a santos e novenas.',
    itemLabel: 'Oração',
    glyph: 'dove',
    priority: 0.9,
    changeFrequency: 'weekly',
    inFooter: true,
  },
  {
    slug: 'salmo',
    kind: 'psalm',
    slugPrefix: 'salmo-',
    group: 'orar',
    label: 'Salmos',
    navNote: 'Os 150 salmos, um a um',
    title: 'Salmos',
    lead: 'Os salmos na íntegra, com o sentido de cada um explicado em linguagem simples, pra rezar entendendo o que se está dizendo.',
    seoTitle: 'Salmos comentados em português para oração diária',
    seoDescription:
      'Salmos bíblicos comentados e em áudio. Salmo 91 (proteção), Salmo 23 (paz), Salmo 27 (coragem) e outros, em português, pra rezar todo dia.',
    itemLabel: 'Salmo',
    glyph: 'stars',
    priority: 0.9,
    changeFrequency: 'weekly',
    inFooter: true,
  },

  // ---------- Todo dia ----------
  {
    slug: 'devocional',
    kind: 'devotional',
    slugPrefix: 'devocional-',
    group: 'diario',
    label: 'Devocional',
    navNote: 'Um momento curto todo dia',
    title: 'Devocional diário',
    lead: 'Um devocional curto por dia: um versículo, uma reflexão de dois minutos e uma oração pra levar junto.',
    seoTitle: 'Devocionais: reflexão e oração para o dia a dia',
    seoDescription:
      'Devocionais cristãos curtos em português. Reflexão, versículo e oração pra começar o dia com fé, lidar com ansiedade, encontrar esperança e crescer espiritualmente.',
    itemLabel: 'Devocional',
    glyph: 'sunrise',
    priority: 0.9,
    changeFrequency: 'daily',
    inFooter: true,
  },
  {
    slug: 'versiculo-do-dia',
    kind: null, // página única, gerada por data
    group: 'diario',
    label: 'Versículo do dia',
    navNote: 'O versículo de hoje',
    title: 'Versículo do dia',
    lead: 'O versículo de hoje, com uma reflexão curta pra começar ou fechar o dia.',
    itemLabel: 'Versículo',
    glyph: 'sun',
    priority: 0.9,
    changeFrequency: 'daily',
    inFooter: true,
  },
  {
    slug: 'frases',
    kind: 'quote_collection',
    slugPrefix: 'frases-',
    group: 'diario',
    label: 'Frases e mensagens',
    navNote: 'Pra compartilhar e refletir',
    title: 'Frases e mensagens de fé',
    lead: 'Frases bíblicas e mensagens de fé separadas por ocasião, pra mandar pra alguém, usar num status ou guardar pra um dia difícil.',
    itemLabel: 'Coletânea',
    glyph: 'quote',
    priority: 0.8,
    changeFrequency: 'weekly',
    inFooter: false,
  },

  // ---------- Aprender ----------
  {
    slug: 'estudo',
    kind: 'study',
    slugPrefix: 'estudo-',
    group: 'aprender',
    label: 'Estudos bíblicos',
    navNote: 'Dons, frutos e temas explicados',
    title: 'Estudos bíblicos',
    lead: 'Temas da fé explicados com calma e com a Bíblia aberta: dons espirituais, frutos do Espírito, oração, família e o que a Palavra diz sobre cada um.',
    itemLabel: 'Estudo',
    glyph: 'flame',
    priority: 0.8,
    changeFrequency: 'weekly',
    inFooter: true,
  },
  {
    slug: 'blog',
    kind: 'article',
    slugPrefix: '',
    group: 'aprender',
    label: 'Vida com fé',
    navNote: 'Família, casamento e superação',
    title: 'Vida com fé',
    lead: 'Textos pra ajudar na vida real: família, casamento, superação e fé no dia a dia. Conversa de gente pra gente, com a Bíblia por perto e sem dedo na cara.',
    seoTitle: 'Blog: vida com fé, família e superação',
    seoDescription:
      'Artigos de ajuda com base bíblica: família, casamento, superação da ansiedade, vida cristã e finanças com fé. Conversa de gente pra gente, sem moralismo.',
    itemLabel: 'Artigo',
    glyph: 'heart',
    priority: 0.8,
    changeFrequency: 'weekly',
    inFooter: true,
  },
];

/** Seção que recebe qualquer kind sem dono declarado. */
const FALLBACK_SLUG = 'oracao';

const bySlug = new Map(SECTIONS.map((s) => [s.slug, s]));

const byKind = new Map();
for (const section of SECTIONS) {
  if (section.kind) byKind.set(section.kind, section);
  for (const extra of section.extraKinds ?? []) byKind.set(extra, section);
}

/** Todos os kinds válidos, derivados das seções (nada de lista paralela). */
export const KINDS = [...byKind.keys()];

/** Seções que listam conteúdo (têm kind). Exclui páginas únicas. */
export const CONTENT_SECTIONS = SECTIONS.filter((s) => s.kind);

export const getSection = (slug) => bySlug.get(slug) ?? null;

export const sectionForKind = (kind) => byKind.get(kind) ?? bySlug.get(FALLBACK_SLUG);

/** Seções de um grupo do menu, na ordem em que foram declaradas. */
export const sectionsInGroup = (groupId) => SECTIONS.filter((s) => s.group === groupId);

/** Estrutura pronta pro mega-menu e pro mapa do site. */
export const navTree = () =>
  NAV_GROUPS.map((group) => ({
    ...group,
    sections: sectionsInGroup(group.id),
  }));

/** Rótulo curto do kind, pra badge de card. */
export const kindLabel = (kind) => sectionForKind(kind)?.itemLabel ?? 'Conteúdo';
