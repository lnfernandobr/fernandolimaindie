import { notFound } from 'next/navigation';
import { getPost, POST_SLUGS, categoryLabel } from '@/lib/content/blog.js';
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

export const revalidate = 86400;

export async function generateStaticParams() {
  return POST_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${slug}`,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
  });
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const path = `/blog/${slug}`;
  const catLabel = categoryLabel(post.category);
  const intentSlug = post.relatedIntent ? INTENT_SLUGS[post.relatedIntent] : null;
  const intentLabel = post.relatedIntent ? INTENT_LABELS[post.relatedIntent] : null;

  const breadcrumbs = [
    { name: 'Início', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.title, path },
  ];

  const nodes = [
    breadcrumbLd(breadcrumbs),
    articleLd({
      headline: post.title,
      description: post.excerpt,
      path,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
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

      <article>
        <header style={{ marginBottom: 'var(--space-5)' }}>
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <a className="tag" href="/blog" style={{ textDecoration: 'none' }}>
              Blog
            </a>
            <span className="tag">{catLabel}</span>
          </div>
          <h1>{post.title}</h1>
          <p className="t-faint" style={{ marginTop: 'var(--space-2)' }}>
            {post.readMins} min de leitura
          </p>
        </header>

        <div className="signal-actions">
          <ShareButton title={post.title} url={absoluteUrl(path)} />
        </div>

        <p id="answer" className="lede">{post.excerpt}</p>

        <AdSlot slot="top-article" />

        <section className="chunk" dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />

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

      <IntentNav currentKey={post.relatedIntent ?? undefined} />
    </main>
  );
}
