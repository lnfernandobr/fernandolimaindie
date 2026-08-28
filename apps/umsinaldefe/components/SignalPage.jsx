import { notFound } from 'next/navigation';
import { getSignal, listSignals } from '@/lib/content/api.js';
import { getSection } from '@/lib/content/taxonomy.js';
import { INTENT_LABELS } from '@/lib/content/intents.js';
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
import { Breadcrumbs } from './Breadcrumbs.jsx';
import { AnswerFirst } from './AnswerFirst.jsx';
import { SummaryBox } from './SummaryBox.jsx';
import { SemanticChunks } from './SemanticChunks.jsx';
import { SemanticFAQ } from './SemanticFAQ.jsx';
import { AdSlot } from './AdSlot.jsx';
import { RelatedSignals } from './RelatedSignals.jsx';
import { TopicSignals } from './TopicSignals.jsx';
import { IntentNav } from './IntentNav.jsx';
import { FavoriteButton } from './FavoriteButton.jsx';
import { ShareButton } from './ShareButton.jsx';

/**
 * Página de conteúdo genérica, montada a partir do registro de seções.
 * Uma seção nova não precisa de página nova: ver app/estudo/[slug]/page.jsx,
 * que tem três linhas.
 */

const full = (section, slugParam) => `${section.slugPrefix ?? ''}${slugParam}`;

export async function signalParams(sectionSlug) {
  const section = getSection(sectionSlug);
  const kinds = [section.kind, ...(section.extraKinds ?? [])].filter(Boolean);
  const { items } = await listSignals({ kinds, limit: 1000 });
  const prefix = section.slugPrefix ?? '';
  return items.map((s) => ({
    slug: prefix && s.slug.startsWith(prefix) ? s.slug.slice(prefix.length) : s.slug,
  }));
}

export async function signalMetadata(sectionSlug, slugParam) {
  const section = getSection(sectionSlug);
  let signal;
  try {
    signal = await getSignal(full(section, slugParam));
  } catch {
    return {};
  }
  return buildMetadata({
    title: signal.title,
    description: signal.answer,
    path: `/${section.slug}/${slugParam}`,
    image: signal.imageUrl ?? undefined,
    type: 'article',
    publishedTime: signal.publishedAt?.toISOString(),
    modifiedTime: signal.updatedAt?.toISOString(),
  });
}

export async function SignalPage({ sectionSlug, slugParam }) {
  const section = getSection(sectionSlug);
  if (!section) notFound();

  let signal;
  try {
    signal = await getSignal(full(section, slugParam));
  } catch {
    notFound();
  }

  const path = `/${section.slug}/${slugParam}`;
  const trail = [
    { name: 'Início', path: '/' },
    { name: section.label, path: `/${section.slug}` },
    { name: signal.title, path },
  ];

  const nodes = [
    breadcrumbLd(trail),
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
  ];

  return (
    <main>
      <script {...jsonLdScript(ldGraph(...nodes))} />
      <Breadcrumbs trail={trail} />

      <article>
        <header className="read-head">
          <div className="read-tags">
            <a className="tag" href={`/${section.slug}`}>{section.label}</a>
            {INTENT_LABELS[signal.intent] && (
              <span className="tag">{INTENT_LABELS[signal.intent]}</span>
            )}
          </div>
          <h1>{signal.title}</h1>
        </header>

        <div className="signal-actions">
          <FavoriteButton slug={signal.slug} />
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
        <RelatedSignals slug={signal.slug} />
        <TopicSignals topicSlug={signal.topicSlug} excludeSlug={signal.slug} />
      </article>

      <IntentNav currentKey={signal.intent} />
    </main>
  );
}
