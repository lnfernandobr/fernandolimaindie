import Link from 'next/link';
import Image from 'next/image';
import Moon from '@/components/Moon';
import { getChannel, listCategories, listPosts } from '@/lib/api';
import { adaptCategory, adaptPost } from '@/lib/adapt';
import { abs, jsonLd } from '@/lib/seo';
import { breadcrumbLd, collectionPageLd } from '@/lib/jsonld';

export const revalidate = 300;

const SOURCES = [
  'Cochrane Reviews',
  'NEJM',
  'Sleep — AASM',
  'Annals of Internal Medicine',
  'J. Sleep Research',
];

const FACTS = [
  {
    n: '01',
    title: 'Dormir 8 horas não é a meta universal',
    body: 'A quantidade ideal de sono varia por genética, idade e fase da vida. O que importa é acordar restaurado — não bater um número arbitrário.',
    source: 'American Academy of Sleep Medicine, 2015',
    href: '/blog',
  },
  {
    n: '02',
    title: 'Insônia começa antes de você deitar',
    body: 'O que acontece nas 6 horas que antecedem o sono determina a noite inteira. Luz artificial, ansiedade e ritmo circadiano constroem — ou destroem — a qualidade do sono.',
    source: 'Sack et al., Sleep Medicine Reviews, 2007',
    href: '/blog',
  },
  {
    n: '03',
    title: 'Suplementos não tratam insônia crônica',
    body: 'Melatonina e magnésio funcionam para ajuste de fase, não para insônia crônica. O tratamento de primeira linha é comportamental — CBT-I tem maior eficácia de longo prazo que fármacos.',
    source: 'Qaseem et al., Annals of Internal Medicine, 2016',
    href: '/blog',
  },
];

export default async function HomePage() {
  const [channel, featured, recent, cats] = await Promise.all([
    getChannel(),
    listPosts({ featured: true, limit: 1 }),
    listPosts({ limit: 7 }),
    listCategories(),
  ]);

  const heroSrc = featured.items[0] ?? recent.items[0];
  const heroPost = heroSrc ? adaptPost(heroSrc) : null;
  const remaining = recent.items
    .filter((p) => !heroSrc || p.id !== heroSrc.id)
    .slice(0, 6)
    .map(adaptPost);
  const uiCats = cats.slice(0, 4).map(adaptCategory);

  const ld = [
    breadcrumbLd([{ name: 'Início', url: abs('/') }]),
    collectionPageLd({
      name: channel.name,
      description: `${channel.name} — conteúdo sobre ${channel.niche}.`,
      url: abs('/'),
      posts: recent.items.slice(0, 10),
    }),
  ];

  return (
    <>
      {ld.map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(data) }}
        />
      ))}

      {/* HERO */}
      <section
        aria-labelledby="hero-title"
        className="border-b border-[var(--color-border)] relative overflow-hidden"
      >
        <div
          className="absolute -top-10 -right-16 opacity-20 pointer-events-none lg:right-10 lg:opacity-35"
          aria-hidden
        >
          <Moon size={260} phase={0.55} />
        </div>
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-20 sm:py-24 lg:py-32 relative">
          <p className="kicker mb-5">Publicação independente sobre ciência do sono</p>
          <h1
            id="hero-title"
            className="serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.05] tracking-tight max-w-3xl"
          >
            Ciência do sono,{' '}
            <em className="not-italic text-[var(--color-amber-glow)]">sem guru</em>.
          </h1>
          <p className="serif text-lg sm:text-xl text-[var(--color-muted)] mt-6 max-w-xl leading-relaxed">
            Artigos baseados em evidências sobre sono, ritmo circadiano e saúde do sono.
            Sem produtos para vender, sem método proprietário para comprar.
          </p>

          <div className="flex flex-wrap gap-2 mt-7" aria-label="Compromissos editoriais">
            {['Sem afiliados', 'Sem suplementos patrocinados', 'Baseado em evidências'].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-dim)] border border-[var(--color-border)] rounded-full px-3 py-1"
              >
                <span className="text-[var(--color-cool-sage)]" aria-hidden>✓</span>
                {label}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mt-9">
            <Link className="btn-primary" href="/blog">
              Ler artigos →
            </Link>
          </div>
        </div>
      </section>

      {/* FONTES */}
      <div
        aria-label="Fontes de referência"
        className="border-b border-[var(--color-border)] bg-[var(--color-ink-dusk)]"
      >
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-[var(--color-text-faint)]">
              Fontes
            </span>
            {SOURCES.map((s) => (
              <span
                key={s}
                className="text-xs text-[var(--color-text-faint)] font-mono"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* FATOS EDITORIAIS */}
      <section aria-label="O que a evidência mostra">
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-16 sm:py-20">
          <p className="kicker mb-4">O que a evidência mostra</p>
          <div className="grid gap-px bg-[var(--color-border)] sm:grid-cols-3 rounded-2xl overflow-hidden">
            {FACTS.map(({ n, title, body, source, href }) => (
              <article
                key={n}
                className="bg-[var(--color-card)] p-7 sm:p-8 flex flex-col gap-5"
              >
                <span
                  aria-hidden
                  className="font-mono text-xs text-[var(--color-text-faint)] tracking-widest"
                >
                  {n}
                </span>
                <div className="flex-1 flex flex-col gap-3">
                  <h3 className="serif text-xl sm:text-2xl font-normal leading-snug tracking-tight">
                    {title}
                  </h3>
                  <p className="serif text-sm sm:text-base text-[var(--color-muted)] leading-relaxed">
                    {body}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-faint)] font-mono mt-auto pt-2 border-t border-[var(--color-border)]">
                    — {source}
                  </p>
                </div>
                <Link
                  href={href}
                  className="text-sm font-medium text-[var(--color-amber-glow)] hover:underline underline-offset-2 self-start"
                >
                  Explorar artigos →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* MANIFESTO EDITORIAL */}
      <section
        aria-label="Sobre esta publicação"
        className="border-t border-[var(--color-border)]"
      >
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-14 sm:py-16">
          <div className="max-w-2xl">
            <p className="kicker mb-4">Sobre esta publicação</p>
            <p className="serif text-xl sm:text-2xl font-normal leading-relaxed text-[var(--color-text-moon)] tracking-tight">
              Sono Profundo não vende suplementos, cursos ou promessas de sete dias.
            </p>
            <p className="serif text-base text-[var(--color-muted)] mt-4 leading-relaxed">
              Reunimos o que a pesquisa atual sabe — e o que ainda não sabe — sobre sono,
              ritmo circadiano e saúde. Cada artigo cita suas fontes. Cada afirmação tem evidência por trás.
              Quando a ciência ainda não tem resposta definitiva, dizemos isso.
            </p>
            <div className="flex flex-wrap gap-6 mt-7 pt-7 border-t border-[var(--color-border)]">
              {[
                { label: 'Independente', desc: 'Sem patrocinadores editoriais' },
                { label: 'Sem afiliados', desc: 'Não vendemos nem indicamos produtos' },
                { label: 'Com fontes', desc: 'Cada artigo cita a pesquisa original' },
              ].map(({ label, desc }) => (
                <div key={label}>
                  <p className="text-sm font-semibold text-[var(--color-text-moon)]">{label}</p>
                  <p className="text-xs text-[var(--color-text-faint)] mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DESTAQUE + RECENTES */}
      {heroPost ? (
        <section
          aria-label="Em destaque"
          className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-14 sm:py-18 border-t border-[var(--color-border)]"
        >
          <div className="grid gap-12 lg:grid-cols-5">
            <article className="lg:col-span-3">
              <Link href={`/blog/${heroPost.slug}`} className="group block">
                {heroPost.coverUrl ? (
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-card)]">
                    <Image
                      src={heroPost.coverUrl}
                      alt={heroPost.coverAlt ?? heroPost.title}
                      fill
                      sizes="(min-width: 1024px) 60vw, 100vw"
                      className="object-cover transition-transform group-hover:scale-[1.02]"
                      priority
                    />
                  </div>
                ) : null}
                <div className="mt-6">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className={`tag tag-${heroPost.catTone}`}>{heroPost.catLabel}</span>
                    <span className="text-xs text-[var(--color-text-faint)]">
                      · {heroPost.minutes} min de leitura
                    </span>
                  </div>
                  <h2 className="serif text-2xl sm:text-3xl lg:text-4xl font-normal leading-tight tracking-tight group-hover:text-[var(--color-amber-glow)] transition-colors">
                    {heroPost.title}
                  </h2>
                  <p className="serif text-base text-[var(--color-muted)] mt-4 leading-relaxed">
                    {heroPost.excerpt}
                  </p>
                </div>
              </Link>
            </article>

            <aside className="lg:col-span-2 space-y-6">
              <h2 className="serif text-xl font-normal border-b border-[var(--color-border)] pb-3">
                Mais recentes
              </h2>
              {remaining.length > 0 ? (
                <ul className="space-y-6">
                  {remaining.slice(0, 4).map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/blog/${p.slug}`}
                        className="grid grid-cols-[88px_1fr] gap-4 items-start group"
                      >
                        {p.coverUrl ? (
                          <div className="relative w-22 h-22 aspect-square rounded-md overflow-hidden">
                            <Image
                              src={p.coverUrl}
                              alt={p.coverAlt ?? p.title}
                              fill
                              sizes="88px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square rounded-md bg-[var(--color-card)]" />
                        )}
                        <div>
                          <span className={`tag tag-${p.catTone} text-[10px]`}>{p.catLabel}</span>
                          <h3 className="serif text-base leading-snug mt-2 group-hover:text-[var(--color-amber-glow)] transition-colors">
                            {p.title}
                          </h3>
                          <p className="text-xs text-[var(--color-text-faint)] mt-1">
                            {p.minutes} min
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--color-muted)]">
                  Os posts gerados pela pipeline da API aparecem aqui.
                </p>
              )}
              <Link className="btn-ghost text-sm w-full justify-center" href="/blog">
                Ver biblioteca completa →
              </Link>
            </aside>
          </div>
        </section>
      ) : null}

      {/* CATEGORIAS */}
      {uiCats.length > 0 ? (
        <section
          aria-label="Navegue por categoria"
          className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-14 border-t border-[var(--color-border)]"
        >
          <p className="kicker mb-3">Por onde começar</p>
          <h2 className="serif text-2xl sm:text-3xl font-normal mb-8 tracking-tight">
            Categorias
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {uiCats.map((c) => (
              <Link
                key={c.id}
                href={`/blog?cat=${c.slug}`}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 hover:border-[var(--color-amber-glow)]/40 transition-colors block min-h-[148px] flex flex-col gap-3"
              >
                <span
                  className="inline-block h-2 w-8 rounded-full"
                  style={{
                    backgroundColor: {
                      rose: 'var(--color-cool-rose)',
                      sage: 'var(--color-cool-sage)',
                      plum: 'var(--color-cool-plum)',
                      deep: 'var(--color-cool-deep)',
                    }[c.catTone],
                  }}
                  aria-hidden
                />
                <div>
                  <h3 className="serif text-lg leading-tight">{c.name}</h3>
                  {c.description ? (
                    <p className="text-sm text-[var(--color-muted)] mt-2 leading-relaxed line-clamp-2">
                      {c.description}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
