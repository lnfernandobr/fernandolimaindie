import { API_URL, CHANNEL_SLUG, HAS_API_CONFIG, SITE_URL } from './config';
import type {
  AuthorDto,
  CategoryDto,
  ChannelDto,
  PostDto,
  TagDto,
} from '@bn/shared';

interface FetchOpts {
  next?: { tags?: string[]; revalidate?: number };
  cache?: 'force-cache' | 'no-store';
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const EMPTY_PAGINATED: Paginated<never> = {
  items: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
};

const PLACEHOLDER_CHANNEL: ChannelDto = {
  id: 'placeholder',
  slug: 'sonoprofundo',
  name: 'Sonoprofundo',
  niche: 'sono',
  siteUrl: SITE_URL,
  language: 'pt-BR',
  timezone: 'America/Sao_Paulo',
  active: false,
  publishFrequency: 'daily',
  publishTimes: [],
  postsPerSlot: 1,
  publishWeekdays: [],
  defaultAuthorName: 'Equipe Sonoprofundo',
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
};

/**
 * Mock determinístico para validar o layout localmente sem Mongo.
 * Quando HAS_API_CONFIG = false, este post é servido em todas as listagens
 * e em /blog/higiene-do-sono-em-7-habitos. Quando a API está no ar,
 * o mock fica completamente fora do caminho.
 */
const MOCK_AUTHOR: AuthorDto = {
  id: 'mock-author',
  channelId: 'placeholder',
  slug: 'fernando',
  name: 'Fernando',
  jobTitle: 'Editor-chefe',
  shortBio: 'Editor-chefe do Sonoprofundo. Cuida da curadoria e revisão dos conteúdos.',
  bio: '# Fernando\n\nEditor-chefe do Sonoprofundo.',
  expertise: ['sono', 'higiene do sono'],
  credentials: [],
  socials: {},
  createdAt: new Date('2026-04-01').toISOString(),
  updatedAt: new Date('2026-05-01').toISOString(),
};

const MOCK_CATEGORY: CategoryDto = {
  id: 'mock-cat',
  channelId: 'placeholder',
  slug: 'higiene-do-sono',
  name: 'Higiene do Sono',
  color: '#e8b66a',
  description: 'Hábitos diurnos e noturnos com evidência clínica para melhorar o sono.',
  order: 0,
  createdAt: new Date('2026-04-01').toISOString(),
  updatedAt: new Date('2026-04-01').toISOString(),
};

const MOCK_POST: PostDto = {
  id: 'mock-post',
  channelId: 'placeholder',
  slug: 'higiene-do-sono-em-7-habitos',
  title: 'Higiene do sono em 7 hábitos com base científica',
  excerpt:
    'Os 7 hábitos com maior evidência científica para melhorar a qualidade do sono — o que cada um faz, em quanto tempo aparece resultado e por onde começar.',
  metaTitle: 'Higiene do sono em 7 hábitos com base científica',
  metaDescription:
    'Os 7 hábitos com maior evidência para dormir melhor: horário fixo, luz, temperatura, cafeína, álcool, exercício e tela.',
  content: `# Higiene do sono em 7 hábitos com base científica

> Post de exemplo: serve como mock local quando a API não está no ar. Em produção, a pipeline de IA gera os posts.

A maioria dos guias de "higiene do sono" mistura prática com mito. Este aqui usa só o que tem evidência clínica consistente — meta-análises, ensaios randomizados — e descarta o resto.

## O que é higiene do sono

Higiene do sono é o conjunto de comportamentos diurnos e noturnos que **regulam o ritmo circadiano** (o relógio biológico interno) e **reduzem a ativação fisiológica** na hora de dormir. Não é cura para insônia clínica — é a base de qualquer protocolo, médico ou não.

## Os 7 hábitos, em ordem de impacto

### 1. Horário fixo de acordar

Esse é o que mais importa. O ritmo circadiano é puxado pelo horário em que você **acorda e recebe luz**, não pelo horário em que vai dormir. Acordar no mesmo horário todos os dias, com variação máxima de 30 minutos, ancora todo o resto.

### 2. Luz forte logo ao acordar

Nos primeiros 60 minutos depois de acordar, busque luz forte — natural se possível. Isso suprime melatonina residual e marca o início do dia para o relógio biológico.

### 3. Temperatura entre 18 e 20 °C

O início do sono está atrelado à queda da temperatura corporal central. Um quarto a 18–20 °C facilita esse processo.

### 4. Sem cafeína depois das 14h

A meia-vida da cafeína é de 5 a 6 horas em adultos saudáveis. Um café às 16h ainda tem 25% circulando à meia-noite.

### 5. Sem álcool 3 horas antes de dormir

Álcool é sedativo no início (você apaga rápido) mas fragmenta a segunda metade da noite, reduzindo sono REM.

### 6. Exercício, mas não tarde

150 minutos por semana de aeróbico moderado é a recomendação. Evite treino intenso nas últimas 4 horas do dia.

### 7. Reduzir tela na cama

A questão não é só luz azul. **Brilho** geral suprime melatonina mais do que comprimento de onda específico.

## Como começar sem fracassar

Não tente os 7 ao mesmo tempo. A evidência comportamental é clara: 2 ou 3 hábitos com consistência rendem mais que 7 hábitos por uma semana e abandono.

**Sequência recomendada:**

1. Semana 1–2: horário fixo de acordar + luz pela manhã.
2. Semana 3–4: cafeína cortada às 14h + temperatura do quarto.
3. Semana 5+: o que sobrar.

## Quando higiene do sono não é suficiente

Se depois de 4 semanas com 4+ hábitos consistentes você ainda demora mais de 30 min para dormir ou se sente cansado durante o dia — procure um especialista. Insônia crônica tem tratamento (TCC-I).
`,
  format: 'how-to',
  status: 'published',
  language: 'pt-BR',
  authorId: 'mock-author',
  author: MOCK_AUTHOR,
  categoryId: 'mock-cat',
  category: MOCK_CATEGORY,
  tags: ['higiene-do-sono', 'iniciante', 'ciencia'],
  coverImage: {
    url: 'https://picsum.photos/seed/higiene-do-sono/1600/900',
    alt: 'Quarto escuro com luz quente baixa, evocando higiene do sono.',
    width: 1600,
    height: 900,
  },
  gallery: [],
  keywords: ['higiene do sono', 'dormir melhor', 'insônia', 'ritmo circadiano'],
  faq: [
    {
      question: 'Em quanto tempo aparece resultado?',
      answer:
        'Em 1 a 3 semanas, segundo os estudos clínicos. Os primeiros sinais aparecem entre o 7º e o 10º dia. Mudanças estruturais no ritmo circadiano levam até 4 semanas.',
    },
    {
      question: 'Preciso aplicar todos os 7 ao mesmo tempo?',
      answer:
        'Não. Aplicar 2 ou 3 hábitos com consistência rende mais que mudar tudo de uma vez. Comece pelo horário fixo de acordar — é o que ancora os outros.',
    },
    {
      question: 'Funciona pra insônia clínica?',
      answer:
        'Higiene do sono sozinha não trata insônia crônica. Para insônia clínica, o tratamento de primeira linha é a TCC-I — terapia cognitivo-comportamental para insônia. Procure um profissional.',
    },
  ],
  howToSteps: [
    { name: 'Horário fixo de acordar', text: 'Acorde no mesmo horário todos os dias, inclusive fim de semana. Variação máxima de 30 minutos.' },
    { name: 'Luz forte logo ao acordar', text: 'Exponha-se à luz natural por 10–20 minutos nos primeiros 60 minutos depois de acordar.' },
    { name: 'Temperatura 18–20 °C', text: 'O quarto precisa estar mais frio do que o resto da casa.' },
    { name: 'Sem cafeína depois das 14h', text: 'Meia-vida da cafeína é de 5–6 horas.' },
    { name: 'Sem álcool 3h antes', text: 'Álcool fragmenta a segunda metade da noite.' },
    { name: 'Exercício até 4h antes', text: '150 min/semana de aeróbico moderado, não tarde.' },
    { name: 'Sem tela na cama', text: 'Modo escuro e brilho mínimo a partir das 21h.' },
  ],
  references: [
    { title: 'Sleep Hygiene Practices and Their Association with Insomnia', url: 'https://pubmed.ncbi.nlm.nih.gov/22119480/', publisher: 'Sleep Medicine Reviews' },
    { title: 'The Effects of Caffeine on Sleep', url: 'https://pubmed.ncbi.nlm.nih.gov/24235903/', publisher: 'Journal of Clinical Sleep Medicine' },
  ],
  wordCount: 380,
  readingTimeMinutes: 4,
  publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  featured: true,
  createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  updatedAtContent: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
};

const MOCK_PAGINATED: Paginated<PostDto> = {
  items: [MOCK_POST],
  total: 1,
  page: 1,
  limit: 20,
  totalPages: 1,
};

async function getJson<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    cache: opts.cache,
    next: opts.next ?? { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`API ${res.status} for ${url}`);
  return (await res.json()) as T;
}

const baseTag = (extra?: string) => [`channel:${CHANNEL_SLUG}`, ...(extra ? [extra] : [])];

async function safeGet<T>(path: string, fallback: T, opts: FetchOpts = {}): Promise<T> {
  if (!HAS_API_CONFIG) return fallback;
  try {
    return await getJson<T>(path, opts);
  } catch (err) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(`[sonoprofundo] API call failed: ${path}`, err);
    }
    return fallback;
  }
}

export async function getChannel(): Promise<ChannelDto> {
  return safeGet<ChannelDto>(
    `/api/v1/public/channels/${CHANNEL_SLUG}`,
    PLACEHOLDER_CHANNEL,
    { next: { tags: baseTag(), revalidate: 600 } },
  );
}

export async function listPosts(
  query: {
    page?: number;
    limit?: number;
    category?: string;
    author?: string;
    tag?: string;
    q?: string;
    featured?: boolean;
  } = {},
): Promise<Paginated<PostDto>> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  }
  return safeGet<Paginated<PostDto>>(
    `/api/v1/public/channels/${CHANNEL_SLUG}/posts?${qs.toString()}`,
    MOCK_PAGINATED,
    { next: { tags: ['posts', ...baseTag()], revalidate: 60 } },
  );
}

export async function getPost(slug: string): Promise<PostDto | null> {
  return safeGet<PostDto | null>(
    `/api/v1/public/channels/${CHANNEL_SLUG}/posts/${slug}`,
    slug === MOCK_POST.slug ? MOCK_POST : null,
    { next: { tags: [`post:${CHANNEL_SLUG}:${slug}`, 'posts', ...baseTag()], revalidate: 120 } },
  );
}

export async function getRelated(slug: string, limit = 4): Promise<PostDto[]> {
  const data = await safeGet<{ items: PostDto[] }>(
    `/api/v1/public/channels/${CHANNEL_SLUG}/related/${slug}?limit=${limit}`,
    { items: [] },
    { next: { tags: ['posts', ...baseTag()], revalidate: 300 } },
  );
  return data.items;
}

export async function listCategories(): Promise<CategoryDto[]> {
  const data = await safeGet<{ items: CategoryDto[] }>(
    `/api/v1/public/channels/${CHANNEL_SLUG}/categories`,
    { items: [MOCK_CATEGORY] },
    { next: { tags: baseTag(), revalidate: 600 } },
  );
  return data.items;
}

export async function getCategory(slug: string): Promise<CategoryDto | null> {
  return safeGet<CategoryDto | null>(
    `/api/v1/public/channels/${CHANNEL_SLUG}/categories/${slug}`,
    slug === MOCK_CATEGORY.slug ? MOCK_CATEGORY : null,
    { next: { tags: baseTag(), revalidate: 600 } },
  );
}

export async function listAuthors(): Promise<AuthorDto[]> {
  const data = await safeGet<{ items: AuthorDto[] }>(
    `/api/v1/public/channels/${CHANNEL_SLUG}/authors`,
    { items: [MOCK_AUTHOR] },
    { next: { tags: baseTag(), revalidate: 600 } },
  );
  return data.items;
}

export async function getAuthor(slug: string): Promise<AuthorDto | null> {
  return safeGet<AuthorDto | null>(
    `/api/v1/public/channels/${CHANNEL_SLUG}/authors/${slug}`,
    slug === MOCK_AUTHOR.slug ? MOCK_AUTHOR : null,
    { next: { tags: baseTag(), revalidate: 600 } },
  );
}

export async function listTags(): Promise<TagDto[]> {
  const data = await safeGet<{ items: TagDto[] }>(
    `/api/v1/public/channels/${CHANNEL_SLUG}/tags`,
    { items: [] },
    { next: { tags: baseTag(), revalidate: 600 } },
  );
  return data.items;
}

export async function searchPosts(q: string, page = 1, limit = 20): Promise<Paginated<PostDto>> {
  const qs = new URLSearchParams({ q, page: String(page), limit: String(limit) });
  return safeGet<Paginated<PostDto>>(
    `/api/v1/public/channels/${CHANNEL_SLUG}/search?${qs.toString()}`,
    MOCK_PAGINATED,
    { next: { revalidate: 60 } },
  );
}

export async function getSitemapData(): Promise<{
  posts: { slug: string; updatedAt: string }[];
  categories: { slug: string; updatedAt: string }[];
  authors: { slug: string; updatedAt: string }[];
}> {
  return safeGet(
    `/api/v1/public/channels/${CHANNEL_SLUG}/sitemap`,
    {
      posts: [{ slug: MOCK_POST.slug, updatedAt: MOCK_POST.updatedAt }],
      categories: [{ slug: MOCK_CATEGORY.slug, updatedAt: MOCK_CATEGORY.updatedAt }],
      authors: [{ slug: MOCK_AUTHOR.slug, updatedAt: MOCK_AUTHOR.updatedAt }],
    },
    { next: { tags: ['posts', ...baseTag()], revalidate: 300 } },
  );
}
