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
  postsPlan: [{ count: 1, targetReadingMinutes: 8 }],
  publishWeekdays: [],
  defaultAuthorName: 'Equipe Sonoprofundo',
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
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
    EMPTY_PAGINATED,
    { next: { tags: ['posts', ...baseTag()], revalidate: 60 } },
  );
}

export async function getPost(slug: string): Promise<PostDto | null> {
  return safeGet<PostDto | null>(
    `/api/v1/public/channels/${CHANNEL_SLUG}/posts/${slug}`,
    null,
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
    { items: [] },
    { next: { tags: baseTag(), revalidate: 600 } },
  );
  return data.items;
}

export async function getCategory(slug: string): Promise<CategoryDto | null> {
  return safeGet<CategoryDto | null>(
    `/api/v1/public/channels/${CHANNEL_SLUG}/categories/${slug}`,
    null,
    { next: { tags: baseTag(), revalidate: 600 } },
  );
}

export async function listAuthors(): Promise<AuthorDto[]> {
  const data = await safeGet<{ items: AuthorDto[] }>(
    `/api/v1/public/channels/${CHANNEL_SLUG}/authors`,
    { items: [] },
    { next: { tags: baseTag(), revalidate: 600 } },
  );
  return data.items;
}

export async function getAuthor(slug: string): Promise<AuthorDto | null> {
  return safeGet<AuthorDto | null>(
    `/api/v1/public/channels/${CHANNEL_SLUG}/authors/${slug}`,
    null,
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
    EMPTY_PAGINATED,
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
    { posts: [], categories: [], authors: [] },
    { next: { tags: ['posts', ...baseTag()], revalidate: 300 } },
  );
}
