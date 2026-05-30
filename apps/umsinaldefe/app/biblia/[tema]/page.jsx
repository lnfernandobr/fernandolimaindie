import { notFound } from 'next/navigation';
import { getVerseTopic, VERSE_TOPIC_SLUGS } from '@/lib/content/biblia.js';
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
import { AudioPlayer } from '@/components/AudioPlayer.jsx';
import { isTtsConfigured } from '@/lib/media/elevenlabs.js';

export const revalidate = 86400;

export async function generateStaticParams() {
  return VERSE_TOPIC_SLUGS.map((tema) => ({ tema }));
}

export async function generateMetadata({ params }) {
  const { tema } = await params;
  const topic = getVerseTopic(tema);
  if (!topic) return {};
  return buildMetadata({
    title: topic.title,
    description: topic.answer,
    path: `/biblia/${tema}`,
    type: 'article',
  });
}

export default async function VerseTopicPage({ params }) {
  const { tema } = await params;
  const topic = getVerseTopic(tema);
  if (!topic) notFound();

  const path = `/biblia/${tema}`;
  const intentSlug = topic.intent ? INTENT_SLUGS[topic.intent] : null;
  const intentLabel = topic.intent ? INTENT_LABELS[topic.intent] : null;

  const breadcrumbs = [
    { name: 'Início', path: '/' },
    { name: 'Bíblia', path: '/biblia' },
    { name: topic.tag, path },
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
            <span className="tag">{topic.tag}</span>
          </div>
          <h1>{topic.title}</h1>
        </header>

        <div className="signal-actions">
          <ShareButton title={topic.title} url={absoluteUrl(path)} />
        </div>

        <p id="answer" className="lede">{topic.answer}</p>

        <AdSlot slot="top-article" />

        <section id="versiculos" className="chunk">
          <h2>Versículos sobre {topic.tag.toLowerCase()}</h2>
          <div className="verse-list">
            {topic.verses.map((vrs) => (
              <figure className="verse" key={vrs.ref}>
                <blockquote className="scripture">&ldquo;{vrs.text}&rdquo;</blockquote>
                <figcaption className="verse-ref">{vrs.ref}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="chunk" dangerouslySetInnerHTML={{ __html: topic.reflectionHtml }} />

        {isTtsConfigured() && (
          <section id="audio" className="chunk">
            <h2>Ouça estes versículos</h2>
            <AudioPlayer
              title={`Versículos sobre ${topic.tag.toLowerCase()}`}
              src={`/api/tts/${tema}`}
              variant="feature"
            />
          </section>
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
