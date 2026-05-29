import { notFound } from 'next/navigation';
import { getSignal, listSignals } from '@/lib/content/api.js';
import { slugToKey, keyToSlug, INTENT_LABELS } from '@/lib/content/intents.js';
import { buildMetadata } from '@/lib/seo/metadata.js';
import {
  articleLd,
  breadcrumbLd,
  speakableLd,
  faqLd,
  audioObjectLd,
  ldGraph,
  jsonLdScript,
} from '@/lib/seo/jsonld.js';
import { absoluteUrl } from '@/lib/site-config.js';
import { AnswerFirst } from '@/components/AnswerFirst.jsx';
import { SummaryBox } from '@/components/SummaryBox.jsx';
import { SemanticChunks } from '@/components/SemanticChunks.jsx';
import { SemanticFAQ } from '@/components/SemanticFAQ.jsx';
import { AdSlot } from '@/components/AdSlot.jsx';
import { RelatedSignals } from '@/components/RelatedSignals.jsx';
import { TopicSignals } from '@/components/TopicSignals.jsx';
import { EntityLinks } from '@/components/EntityLinks.jsx';
import { IntentNav } from '@/components/IntentNav.jsx';
import { FavoriteButton } from '@/components/FavoriteButton.jsx';
import { ShareButton } from '@/components/ShareButton.jsx';

export const revalidate = 86400;

export async function generateStaticParams() {
  try {
    const { items } = await listSignals({ limit: 500 });
    return items.map((s) => ({ intent: keyToSlug(s.intent), slug: s.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { intent: intentSlug, slug } = await params;
  const intentKey = slugToKey(intentSlug);
  if (!intentKey) return {};
  let signal;
  try {
    signal = await getSignal(slug);
  } catch {
    return {};
  }
  if (signal.intent !== intentKey) return {};
  return buildMetadata({
    title: signal.title,
    description: signal.answer,
    path: `/${intentSlug}/${slug}`,
    image: signal.imageUrl ?? undefined,
    type: 'article',
    publishedTime: signal.publishedAt?.toISOString(),
    modifiedTime: signal.updatedAt?.toISOString(),
  });
}

export default async function SignalPage({ params }) {
  const { intent: intentSlug, slug } = await params;
  const intentKey = slugToKey(intentSlug);
  if (!intentKey) notFound();

  let signal;
  try {
    signal = await getSignal(slug);
  } catch {
    notFound();
  }

  if (signal.intent !== intentKey) notFound();

  const path = `/${intentSlug}/${slug}`;
  const intentLabel = INTENT_LABELS[intentKey];

  const breadcrumbs = [
    { name: 'Início', path: '/' },
    { name: intentLabel, path: `/${intentSlug}` },
    { name: signal.title, path },
  ];

  const nodes = [
    breadcrumbLd(breadcrumbs),
    articleLd({
      headline: signal.title,
      description: signal.answer,
      path,
      image: signal.imageUrl,
      datePublished: signal.publishedAt?.toISOString(),
      dateModified: signal.updatedAt?.toISOString() ?? signal.publishedAt?.toISOString(),
    }),
    speakableLd(),
    signal.faq?.length ? faqLd(signal.faq) : null,
    signal.audioUrl
      ? audioObjectLd({
          name: signal.title,
          url: absoluteUrl(path),
          contentUrl: signal.audioUrl,
          transcript: signal.answer,
        })
      : null,
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
            <a className="tag" href={`/${intentSlug}`} style={{ textDecoration: 'none' }}>
              {intentLabel}
            </a>
            <span className="tag">{signal.kind}</span>
          </div>
          <h1>{signal.title}</h1>
        </header>

        <div className="signal-actions">
          <FavoriteButton slug={slug} />
          <ShareButton title={signal.title} url={absoluteUrl(path)} />
        </div>

        <AnswerFirst answer={signal.answer} />

        <AdSlot slot="top-article" />

        <SummaryBox summary={signal.summary} />

        <SemanticChunks chunks={signal.chunks} />

        {!signal.chunks?.length && signal.bodyHtml && (
          <section id="body" className="chunk">
            <div dangerouslySetInnerHTML={{ __html: signal.bodyHtml }} />
          </section>
        )}

        <SemanticFAQ entries={signal.faq} />

        {signal.audioUrl && (
          <section id="audio" className="chunk">
            <h2>Ouça esta oração</h2>
            <audio controls src={signal.audioUrl} preload="none">
              <track kind="captions" label="Transcrição" srcLang="pt" />
            </audio>
          </section>
        )}

        <EntityLinks entitySlugs={signal.entitySlugs} />

        <RelatedSignals slug={slug} />

        <TopicSignals topicSlug={signal.topicSlug} excludeSlug={slug} />
      </article>

      <IntentNav currentKey={intentKey} />
    </main>
  );
}
