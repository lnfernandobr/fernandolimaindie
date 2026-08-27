import { notFound } from 'next/navigation';
import { getSignal, listSignals } from '@/lib/content/api.js';
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
  const { items } = await listSignals({ kind: 'verse_collection', limit: 1000 });
  return items.map((s) => ({ tema: s.slug.replace(/^biblia-/, '') }));
}

const temaLabel = (tema) => (tema ?? '').replace(/-/g, ' ');

export async function generateMetadata({ params }) {
  const { tema } = await params;
  let topic;
  try {
    topic = await getSignal(`biblia-${tema}`);
  } catch {
    return {};
  }
  return buildMetadata({
    title: topic.title,
    description: topic.answer,
    path: `/biblia/${tema}`,
    type: 'article',
  });
}

export default async function VerseTopicPage({ params }) {
  const { tema } = await params;

  let topic;
  try {
    topic = await getSignal(`biblia-${tema}`);
  } catch {
    notFound();
  }

  const path = `/biblia/${tema}`;
  const label = temaLabel(tema);
  const intentSlug = topic.intent ? INTENT_SLUGS[topic.intent] : null;
  const intentLabel = topic.intent ? INTENT_LABELS[topic.intent] : null;

  const breadcrumbs = [
    { name: 'Início', path: '/' },
    { name: 'Bíblia', path: '/biblia' },
    { name: topic.title, path },
  ];

  const nodes = [
    breadcrumbLd(breadcrumbs),
    articleLd({
      headline: topic.title,
      description: topic.answer,
      path,
    }),
    speakableLd(['#answer']),
    topic.faq?.length ? faqLd(topic.faq) : null,
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
            <a className="tag" href="/biblia" style={{ textDecoration: 'none' }}>
              Bíblia
            </a>
          </div>
          <h1>{topic.title}</h1>
        </header>

        {topic.imageUrl && (
          <figure className="post-hero">
            <img
              src={topic.imageUrl}
              alt={topic.title}
              loading="eager"
              decoding="async"
              width={1200}
              height={630}
              style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius-lg)', aspectRatio: '1200/630', objectFit: 'cover' }}
            />
          </figure>
        )}

        <div className="signal-actions">
          <ShareButton title={topic.title} url={absoluteUrl(path)} />
        </div>

        <p id="answer" className="lede">{topic.answer}</p>

        <AdSlot slot="top-article" />

        {topic.verses?.length > 0 && (
          <section id="versiculos" className="chunk">
            <h2>Versículos sobre {label}</h2>
            <div className="verse-list">
              {topic.verses.map((vrs) => (
                <figure className="verse" key={vrs.ref}>
                  <blockquote className="scripture">&ldquo;{vrs.text}&rdquo;</blockquote>
                  <figcaption className="verse-ref">{vrs.ref}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {topic.bodyHtml && (
          <section className="chunk" dangerouslySetInnerHTML={{ __html: topic.bodyHtml }} />
        )}

        <SemanticFAQ entries={topic.faq} />

        {intentSlug && (
          <section className="chunk">
            <h2>Para ir além</h2>
            <p>
              Quer levar esse tema pra oração? Veja as{' '}
              <a href={`/${intentSlug}`}>orações e reflexões sobre {intentLabel.toLowerCase()}</a>,
              ou comece pelo <a href="/devocional">devocional de hoje</a>.
            </p>
          </section>
        )}
      </article>

      <IntentNav currentKey={topic.intent ?? undefined} />
    </main>
  );
}
