import { notFound } from 'next/navigation';
import { getSignal, listSignals } from '@/lib/content/api.js';
import { categoryLabel } from '@/lib/content/categories.js';
import { INTENT_SLUGS, INTENT_LABELS } from '@/lib/content/intents.js';
import { buildMetadata } from '@/lib/seo/metadata.js';
import {
  articleLd,
  breadcrumbLd,
  speakableLd,
  faqLd,
  ldGraph,
  jsonLdScript,
} from '@/lib/seo/jsonld.js';
import { absoluteUrl } from '@/lib/site-config.js';
import { AdSlot } from '@/components/AdSlot.jsx';
import { SemanticFAQ } from '@/components/SemanticFAQ.jsx';
import { ShareButton } from '@/components/ShareButton.jsx';
import { IntentNav } from '@/components/IntentNav.jsx';

export async function generateStaticParams() {
  const { items } = await listSignals({ kind: 'article', limit: 1000 });
  return items.map((s) => ({ slug: s.slug }));
}

/** Extrai os H2s do bodyHtml pra montar o índice (TOC). */
function extractHeadings(html) {
  const matches = [...(html ?? '').matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)];
  return matches.map((m, i) => {
    const text = m[1].replace(/<[^>]+>/g, '');
    const id = `s${i + 1}`;
    return { id, text };
  });
}

/** Injeta ids nos H2 do body pra ancoragem do TOC. */
function injectHeadingIds(html) {
  let i = 0;
  return (html ?? '').replace(/<h2([^>]*)>/gi, () => {
    i++;
    return `<h2 id="s${i}">`;
  });
}

/** Estima minutos de leitura (~200 palavras/min) a partir do bodyHtml. */
function readingMinutes(html) {
  const words = (html ?? '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  let post;
  try {
    post = await getSignal(slug);
  } catch {
    return {};
  }
  return buildMetadata({
    title: post.title,
    description: post.answer,
    path: `/blog/${slug}`,
    type: 'article',
    image: post.imageUrl ?? undefined,
    publishedTime: post.publishedAt?.toISOString(),
    modifiedTime: post.updatedAt?.toISOString(),
  });
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;

  let post;
  try {
    post = await getSignal(slug);
  } catch {
    notFound();
  }

  const path = `/blog/${slug}`;
  const catLabel = categoryLabel(post.category);
  const intentSlug = post.intent ? INTENT_SLUGS[post.intent] : null;
  const intentLabel = post.intent ? INTENT_LABELS[post.intent] : null;
  const headings = extractHeadings(post.bodyHtml);
  const bodyWithIds = injectHeadingIds(post.bodyHtml);
  const readMins = readingMinutes(post.bodyHtml);

  const breadcrumbs = [
    { name: 'Início', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.title, path },
  ];

  const nodes = [
    breadcrumbLd(breadcrumbs),
    articleLd({
      headline: post.title,
      description: post.answer,
      path,
      image: post.imageUrl,
      datePublished: post.publishedAt?.toISOString(),
      dateModified: post.updatedAt?.toISOString() ?? post.publishedAt?.toISOString(),
    }),
    speakableLd(['#answer']),
    post.faq?.length ? faqLd(post.faq) : null,
  ];

  return (
    <main>
      <script {...jsonLdScript(ldGraph(...nodes))} />

      <nav aria-label="Navegação estrutural" className="breadcrumb">
        <ol>
          {breadcrumbs.map((crumb, i) => (
            <li key={crumb.path}>
              {i < breadcrumbs.length - 1 ? (
                <a href={crumb.path}>{crumb.name}</a>
              ) : (
                <span aria-current="page">{crumb.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <article itemScope itemType="https://schema.org/Article">
        <header className="post-header">
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <a className="tag" href="/blog" style={{ textDecoration: 'none' }}>Blog</a>
            <span className="tag">{catLabel}</span>
          </div>
          <h1 itemProp="headline">{post.title}</h1>
          <p className="t-faint" style={{ marginTop: 'var(--space-2)' }}>
            {readMins} min de leitura
          </p>
        </header>

        {post.imageUrl && (
          <figure className="post-hero">
            <img
              src={post.imageUrl}
              alt={post.title}
              loading="eager"
              decoding="async"
              width={1200}
              height={630}
              style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius-lg)', aspectRatio: '1200/630', objectFit: 'cover' }}
            />
          </figure>
        )}

        <div className="signal-actions">
          <ShareButton title={post.title} url={absoluteUrl(path)} />
        </div>

        {/* Resposta direta (answer-first, speakable) */}
        <p id="answer" className="lede" itemProp="description">{post.answer}</p>

        {/* Índice (TOC) */}
        {headings.length >= 3 && (
          <nav className="toc" aria-label="Índice do artigo">
            <strong>Neste artigo:</strong>
            <ol>
              {headings.map((h) => (
                <li key={h.id}><a href={`#${h.id}`}>{h.text}</a></li>
              ))}
            </ol>
          </nav>
        )}

        <AdSlot slot="top-article" />

        {/* Corpo do artigo (com IDs nos H2 pra ancoragem do TOC) */}
        <section className="chunk post-body" itemProp="articleBody" dangerouslySetInnerHTML={{ __html: bodyWithIds }} />

        <SemanticFAQ entries={post.faq} />

        {intentSlug && (
          <section className="chunk">
            <h2>Para ir além</h2>
            <p>
              Veja também as{' '}
              <a href={`/${intentSlug}`}>orações e reflexões sobre {intentLabel.toLowerCase()}</a>{' '}
              e os <a href="/biblia">versículos por tema</a>.
            </p>
          </section>
        )}
      </article>

      <IntentNav currentKey={post.intent ?? undefined} />
    </main>
  );
}
