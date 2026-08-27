import { notFound } from 'next/navigation';
import { listSignals } from '@/lib/content/api.js';
import {
  slugToKey,
  INTENT_LABELS,
  INTENT_DESCRIPTIONS,
  INTENT_SLUGS,
} from '@/lib/content/intents.js';
import { buildMetadata } from '@/lib/seo/metadata.js';
import { Breadcrumbs } from '@/components/Breadcrumbs.jsx';
import { CardGrid, ContentCard } from '@/components/ContentCard.jsx';
import { Glyph } from '@/components/Glyph.jsx';
import { AdSlot } from '@/components/AdSlot.jsx';
import { IntentNav } from '@/components/IntentNav.jsx';

export const revalidate = 86400;

export async function generateStaticParams() {
  return Object.values(INTENT_SLUGS).map((intent) => ({ intent }));
}

export async function generateMetadata({ params }) {
  const { intent: intentSlug } = await params;
  const intentKey = slugToKey(intentSlug);
  if (!intentKey) return {};

  const { items } = await listSignals({ intent: intentKey, limit: 1 });

  return buildMetadata({
    title: `${INTENT_LABELS[intentKey]}: orações e reflexões`,
    description: INTENT_DESCRIPTIONS[intentKey],
    path: `/${intentSlug}`,
    // Sem conteúdo ainda, a página fica fora do índice pra não virar página fina.
    noIndex: items.length === 0,
  });
}

export default async function IntentHubPage({ params }) {
  const { intent: intentSlug } = await params;
  const intentKey = slugToKey(intentSlug);
  if (!intentKey) notFound();

  const label = INTENT_LABELS[intentKey];
  const description = INTENT_DESCRIPTIONS[intentKey];
  const { items: signals } = await listSignals({ intent: intentKey, limit: 40 });

  return (
    <main className="hub">
      <Breadcrumbs
        trail={[
          { name: 'Início', path: '/' },
          { name: label, path: `/${intentSlug}` },
        ]}
      />

      <header className="hub-head">
        <span className="hub-icon" aria-hidden="true">
          <Glyph name="heart" size={26} />
        </span>
        <h1 className="display hub-title">{label}</h1>
        <p className="lede hub-lead">{description}</p>
        {signals.length > 0 && (
          <p className="hub-count t-faint">
            {signals.length} {signals.length === 1 ? 'conteúdo' : 'conteúdos'}
          </p>
        )}
      </header>

      <AdSlot slot="hub-top" />

      {signals.length > 0 ? (
        <section aria-label={`Conteúdo sobre ${label}`} className="hub-block">
          <CardGrid label={label}>
            {signals.map((signal) => (
              <ContentCard key={signal.slug} signal={signal} />
            ))}
          </CardGrid>
        </section>
      ) : (
        <p className="hub-empty t-soft">
          Ainda não temos conteúdo sobre {label.toLowerCase()}. Está a caminho.
        </p>
      )}

      <IntentNav currentKey={intentKey} />
    </main>
  );
}
