/**
 * Taxonomia de categorias do blog (estrutural, nao e conteudo).
 * O conteudo dos posts vem da API (signals kind=article). Aqui ficam apenas
 * os rotulos/descricoes usados pra agrupar e exibir as categorias.
 */
export const BLOG_CATEGORIES = [
  { slug: 'familia', label: 'Família', description: 'Casa, filhos, educação e harmonia no lar.' },
  { slug: 'casamento', label: 'Casamento', description: 'Vida a dois, conflitos e companheirismo.' },
  { slug: 'superacao', label: 'Superação', description: 'Ansiedade, medo, luto e recomeços com fé.' },
  { slug: 'vida-crista', label: 'Vida cristã', description: 'Oração, leitura da Bíblia e crescimento espiritual.' },
  { slug: 'financas', label: 'Finanças com fé', description: 'Dívidas, trabalho e provisão sem desespero.' },
  { slug: 'biblia-explicada', label: 'Bíblia explicada', description: 'Versículos por tema e passagens explicadas com simplicidade.' },
  { slug: 'salmos', label: 'Salmos explicados', description: 'O sentido dos salmos, um a um, pra rezar com entendimento.' },
  { slug: 'oracoes', label: 'Orações', description: 'Orações tradicionais, aos santos e para cada momento.' },
];

export const getCategory = (slug) => BLOG_CATEGORIES.find((c) => c.slug === slug) ?? null;

export const categoryLabel = (slug) => getCategory(slug)?.label ?? slug;
