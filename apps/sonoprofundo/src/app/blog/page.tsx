import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getCategory, getChannel, listCategories, listPosts, searchPosts } from '@/lib/api';
import { adaptPost } from '@/lib/adapt';
import { abs, jsonLd } from '@/lib/seo';
import { breadcrumbLd, collectionPageLd } from '@/lib/jsonld';

interface PageProps {
  searchParams: Promise<{ cat?: string; q?: string; page?: string }>;
}

export const revalidate = 120;

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const channel = await getChannel();
  if (sp.cat) {
    const c = await getCategory(sp.cat);
    if (c) {
      return {
        title: `${c.name} — ${channel.name}`,
        description: c.description ?? `Artigos sobre ${c.name}.`,
        alternates: { canonical: abs(`/blog?cat=${c.slug}`) },
      };
    }
  }
  if (sp.q) {
    return {
      title: `Busca: ${sp.q}`,
      description: `Resultados para "${sp.q}".`,
      robots: { index: false, follow: true },
    };
  }
  return {
    title: 'Blog',
    description: `Artigos do ${channel.name}.`,
    alternates: { canonical: abs('/blog') },
  };
}

export default async function BlogPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const limit = 12;

  const [, cats] = await Promise.all([getChannel(), listCategories()]);

  const list = sp.q
    ? await searchPosts(sp.q, page, limit)
    : await listPosts({
        page,
        limit,
        ...(sp.cat ? { category: sp.cat } : {}),
      });

  const items = list.items.map(adaptPost);
  const activeCat = sp.cat ?? 'all';
  const baseHref = sp.q
    ? `/blog?q=${encodeURIComponent(sp.q)}`
    : `/blog${activeCat !== 'all' ? `?cat=${activeCat}` : ''}`;

  const pageTitle = sp.q
    ? `Busca: "${sp.q}"`
    : sp.cat
      ? cats.find((c) => c.slug === sp.cat)?.name ?? 'Categoria'
      : 'Biblioteca completa';

  const ld = [
    breadcrumbLd([
      { name: 'Início', url: abs('/') },
      { name: 'Blog', url: abs('/blog') },
      ...(sp.cat ? [{ name: pageTitle, url: abs(`/blog?cat=${sp.cat}`) }] : []),
    ]),
    collectionPageLd({
      name: typeof pageTitle === 'string' ? pageTitle : 'Blog',
      url: abs(baseHref),
      posts: list.items,
    }),
  ];

  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-12 sm:py-16">
      {ld.map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(data) }}
        />
      ))}

      <header className="mb-10 sm:mb-12">
        <p className="kicker mb-3">{sp.q ? 'Busca' : 'Biblioteca'}</p>
        <h1 className="serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight max-w-3xl">
          {pageTitle}
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-3">{list.total} artigo{list.total === 1 ? '' : 's'}</p>
      </header>

      {/* Busca + filtros de categoria */}
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] mb-8">
        <form action="/blog" method="get" role="search">
          <label htmlFor="search" className="sr-only">Buscar artigos</label>
          <input
            id="search"
            type="search"
            name="q"
            defaultValue={sp.q ?? ''}
            placeholder="Buscar artigos…"
            className="w-full px-5 py-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-full text-sm text-[var(--color-fg)] outline-none focus:border-[var(--color-amber-glow)]/50"
          />
        </form>
        <nav aria-label="Categorias" className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[{ slug: 'all', name: 'Todos' }, ...cats].map((c) => {
            const active = (c.slug === 'all' && !sp.cat) || sp.cat === c.slug;
            const href = c.slug === 'all' ? '/blog' : `/blog?cat=${c.slug}`;
            return (
              <Link
                key={c.slug}
                href={href}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
                  active
                    ? 'bg-[var(--color-amber-glow)] text-[var(--color-ink-void)] border-transparent'
                    : 'bg-[var(--color-card)] text-[var(--color-muted)] border-[var(--color-border)] hover:text-[var(--color-fg)]'
                }`}
              >
                {c.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {items.length === 0 ? (
        <p className="serif text-lg text-[var(--color-muted)] py-12">
          Nenhum artigo encontrado.
        </p>
      ) : (
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <li key={p.id}>
              <article>
                <Link href={`/blog/${p.slug}`} className="group block">
                  {p.coverUrl ? (
                    <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-[var(--color-border)] bg-[var(--color-card)]">
                      <Image
                        src={p.coverUrl}
                        alt={p.coverAlt ?? p.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform group-hover:scale-[1.02]"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] rounded-lg bg-[var(--color-card)] border border-[var(--color-border)]" />
                  )}
                  <div className="mt-4 flex items-center gap-2">
                    <span className={`tag tag-${p.catTone}`}>{p.catLabel}</span>
                    <span className="text-xs text-[var(--color-text-faint)]">· {p.minutes} min</span>
                  </div>
                  <h2 className="serif text-xl font-normal leading-tight mt-3 group-hover:text-[var(--color-amber-glow)] transition-colors">
                    {p.title}
                  </h2>
                  <p className="serif text-sm text-[var(--color-muted)] mt-2 leading-relaxed line-clamp-2">{p.excerpt}</p>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      )}

      {list.totalPages > 1 ? (
        <nav aria-label="Paginação" className="flex justify-between items-center mt-12 pt-8 border-t border-[var(--color-border)]">
          {page > 1 ? (
            <Link
              className="btn-ghost text-sm"
              href={`${baseHref}${baseHref.includes('?') ? '&' : '?'}page=${page - 1}`}
            >
              ← Anterior
            </Link>
          ) : <span />}
          <span className="text-xs text-[var(--color-muted)]">
            página {page} de {list.totalPages}
          </span>
          {page < list.totalPages ? (
            <Link
              className="btn-ghost text-sm"
              href={`${baseHref}${baseHref.includes('?') ? '&' : '?'}page=${page + 1}`}
            >
              Próxima →
            </Link>
          ) : <span />}
        </nav>
      ) : null}
    </div>
  );
}
