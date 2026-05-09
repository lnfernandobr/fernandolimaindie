import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getChannel, getPost, getRelated, getSitemapData } from '@/lib/api';
import { adaptPost } from '@/lib/adapt';
import { extractToc, renderMarkdown } from '@/lib/markdown';
import { abs, jsonLd, postMetadata } from '@/lib/seo';
import { articleLd, breadcrumbLd, faqLd } from '@/lib/jsonld';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 120;

export async function generateStaticParams() {
  const data = await getSitemapData();
  return data.posts.slice(0, 100).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [channel, post] = await Promise.all([getChannel(), getPost(slug)]);
  if (!post) return { title: 'Não encontrado', robots: { index: false, follow: false } };
  return postMetadata(channel, post);
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const [channel, post] = await Promise.all([getChannel(), getPost(slug)]);
  if (!post) return notFound();

  const related = (await getRelated(slug, 3)).map(adaptPost);
  const ui = adaptPost(post);

  const toc = extractToc(post.content);
  const html = renderMarkdown(post.content);

  const ld: unknown[] = [
    breadcrumbLd([
      { name: 'Início', url: abs('/') },
      { name: 'Blog', url: abs('/blog') },
      ...(post.category
        ? [{ name: post.category.name, url: abs(`/blog?cat=${post.category.slug}`) }]
        : []),
      { name: post.title, url: abs(`/blog/${post.slug}`) },
    ]),
    articleLd(channel, post),
  ];
  const faq = faqLd(post);
  if (faq) ld.push(faq);

  return (
    <article className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-10 sm:py-14">
      {ld.map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(data) }}
        />
      ))}

      {/* Breadcrumb visual */}
      <nav aria-label="Trilha" className="text-xs text-[var(--color-muted)] mb-6">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-[var(--color-fg)]">Início</Link></li>
          <li aria-hidden>/</li>
          <li><Link href="/blog" className="hover:text-[var(--color-fg)]">Blog</Link></li>
          {post.category ? (
            <>
              <li aria-hidden>/</li>
              <li>
                <Link href={`/blog?cat=${post.category.slug}`} className="hover:text-[var(--color-fg)]">
                  {post.category.name}
                </Link>
              </li>
            </>
          ) : null}
        </ol>
      </nav>

      {/* CABEÇALHO */}
      <header className="max-w-3xl">
        <div className="flex items-center gap-2.5 mb-4">
          <span className={`tag tag-${ui.catTone}`}>{ui.catLabel}</span>
          <span className="text-xs text-[var(--color-text-faint)]">
            · {ui.minutes} min de leitura
          </span>
        </div>
        <h1 className="serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight tracking-tight">
          {post.title}
        </h1>
        {post.excerpt ? (
          <p className="serif text-lg sm:text-xl text-[var(--color-muted)] leading-relaxed mt-5">
            {post.excerpt}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-6 pt-5 border-t border-[var(--color-border)] text-sm text-[var(--color-muted)]">
          {post.publishedAt ? (
            <span>
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            </span>
          ) : null}
          <span>· {post.wordCount} palavras</span>
        </div>
      </header>

      {/* COVER */}
      {post.coverImage?.url ? (
        <figure className="mt-10 rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-card)]">
          <div className="relative aspect-[16/9]">
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.alt ?? post.title}
              fill
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="object-cover"
            />
          </div>
          {post.coverImage.caption ? (
            <figcaption className="text-xs text-[var(--color-muted)] p-3">
              {post.coverImage.caption}
              {post.coverImage.credit ? <> · <em>{post.coverImage.credit}</em></> : null}
            </figcaption>
          ) : null}
        </figure>
      ) : null}

      {/* CORPO + SUMÁRIO STICKY */}
      <div className="grid lg:grid-cols-[1fr_260px] gap-10 lg:gap-12 mt-12">
        <div className="prose-editorial" dangerouslySetInnerHTML={{ __html: html }} />
        {toc.length > 0 ? (
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="kicker mb-3">Sumário</p>
              <nav aria-label="Sumário do artigo">
                <ol className="space-y-2 text-sm">
                  {toc.map((t) => (
                    <li
                      key={t.id}
                      style={{ paddingLeft: `${(t.depth - 2) * 0.875}rem` }}
                      className="leading-snug"
                    >
                      <a
                        href={`#${t.id}`}
                        className="text-[var(--color-muted)] hover:text-[var(--color-amber-glow)] transition-colors"
                      >
                        {t.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
              {post.tags.length > 0 ? (
                <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
                  <p className="kicker mb-3">Tags</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {post.tags.map((t) => (
                      <li key={t}>
                        <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-muted)]">
                          #{t}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </aside>
        ) : null}
      </div>

      {/* FAQ */}
      {post.faq && post.faq.length > 0 ? (
        <section aria-labelledby="faq-title" className="mt-16 max-w-3xl">
          <p className="kicker mb-3">Perguntas frequentes</p>
          <h2 id="faq-title" className="serif text-2xl sm:text-3xl font-normal mb-6 tracking-tight">FAQ</h2>
          <div className="space-y-3">
            {post.faq.map((q, i) => (
              <details
                key={i}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 group"
              >
                <summary className="serif text-lg cursor-pointer marker:hidden list-none flex justify-between items-center gap-4">
                  <span>{q.question}</span>
                  <span className="text-[var(--color-amber-glow)] text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="serif text-base text-[var(--color-muted)] leading-relaxed mt-3">
                  {q.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {/* REFERÊNCIAS */}
      {post.references && post.references.length > 0 ? (
        <section aria-labelledby="refs-title" className="mt-12 max-w-3xl">
          <h2 id="refs-title" className="serif text-2xl font-normal mb-4 tracking-tight">
            Fontes e referências
          </h2>
          <ul className="space-y-2 text-sm">
            {post.references.map((r, i) => (
              <li key={i}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener"
                  className="text-[var(--color-amber-glow)] hover:underline"
                >
                  {r.title}
                </a>
                {r.publisher ? <span className="text-[var(--color-muted)]"> — {r.publisher}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* RELACIONADOS */}
      {related.length > 0 ? (
        <section aria-labelledby="related-title" className="mt-16 pt-12 border-t border-[var(--color-border)]">
          <h2 id="related-title" className="serif text-2xl sm:text-3xl font-normal mb-8 tracking-tight">
            Continue lendo
          </h2>
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <li key={p.id}>
                <Link href={`/blog/${p.slug}`} className="group block">
                  {p.coverUrl ? (
                    <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-[var(--color-border)] bg-[var(--color-card)]">
                      <Image
                        src={p.coverUrl}
                        alt={p.coverAlt ?? p.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover transition-transform group-hover:scale-[1.02]"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] rounded-lg bg-[var(--color-card)] border border-[var(--color-border)]" />
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`tag tag-${p.catTone}`}>{p.catLabel}</span>
                  </div>
                  <h3 className="serif text-lg leading-tight mt-2 group-hover:text-[var(--color-amber-glow)] transition-colors">
                    {p.title}
                  </h3>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
