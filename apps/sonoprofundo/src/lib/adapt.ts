/**
 * Adapter entre o `PostDto`/`CategoryDto` da API central e o shape visual
 * usado pelos componentes do canal (tags coloridas, capa).
 *
 * O design tem 4 cores fixas para categoria (rose/sage/plum/deep). Como a API
 * serve categorias dinâmicas, derivamos `catTone`/`tone` por hash determinístico
 * do slug — a mesma categoria sempre tem a mesma cor entre páginas e canais.
 */

import type { CategoryDto, PostDto } from '@bn/shared';

export type CatTone = 'rose' | 'sage' | 'plum' | 'deep';
export type ImageTone = 'cool' | 'amber' | 'plum' | 'sage';

const CAT_TONES: CatTone[] = ['rose', 'sage', 'plum', 'deep'];
const IMAGE_TONES: ImageTone[] = ['cool', 'amber', 'plum', 'sage'];

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function categoryToneOf(slug: string | undefined): CatTone {
  if (!slug) return 'sage';
  return CAT_TONES[hash(slug) % CAT_TONES.length]!;
}

export function imageToneOf(slug: string | undefined): ImageTone {
  if (!slug) return 'cool';
  return IMAGE_TONES[hash(slug) % IMAGE_TONES.length]!;
}

export interface UiPost {
  slug: string;
  id: string;
  title: string;
  excerpt: string;
  category: string;
  catLabel: string;
  catTone: CatTone;
  tone: ImageTone;
  minutes: number;
  date: string; // formatado em pt-BR
  author: string;
  coverUrl?: string;
  coverAlt?: string;
}

export function adaptPost(p: PostDto): UiPost {
  const catSlug = p.category?.slug ?? 'geral';
  const catLabel = p.category?.name ?? 'Geral';
  return {
    slug: p.slug,
    id: p.id,
    title: p.title,
    excerpt: p.excerpt,
    category: catSlug,
    catLabel,
    catTone: categoryToneOf(catSlug),
    tone: imageToneOf(p.slug),
    minutes: p.readingTimeMinutes ?? 5,
    date: formatDate(p.publishedAt ?? p.createdAt),
    author: p.author?.name ?? 'Equipe sonoprofundo',
    coverUrl: p.coverImage?.url,
    coverAlt: p.coverImage?.alt,
  };
}

export interface UiCategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
  catTone: CatTone;
}

export function adaptCategory(c: CategoryDto): UiCategory {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    catTone: categoryToneOf(c.slug),
  };
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}
