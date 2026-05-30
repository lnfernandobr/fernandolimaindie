import { notFound } from 'next/navigation';
import { listSignals } from '@/lib/content/api.js';
import {
  slugToKey,
  INTENT_LABELS,
  INTENT_DESCRIPTIONS,
  INTENT_SLUGS,
} from '@/lib/content/intents.js';
import { signalUrl } from '@/lib/content/signal-url.js';
import { buildMetadata } from '@/lib/seo/metadata.js';
import { breadcrumbLd, ldGraph, jsonLdScript } from '@/lib/seo/jsonld.js';
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
  const label = INTENT_LABELS[intentKey];
  return buildMetadata({
    title: `${label}: orações e reflexões`,
    description: INTENT_DESCRIPTIONS[intentKey],
    path: `/${intentSlug}`,
  });
}

export default async function IntentHubPage({ params }) {
  const { intent: intentSlug } = await params;
  const intentKey = slugToKey(intentSlug);
  if (!intentKey) notFound();

  const label = INTENT_LABELS[intentKey];
  const description = INTENT_DESCRIPTIONS[intentKey];

  let signals = [];
  try {
    const result = await listSignals({ intent: intentKey, limit: 20 });
    signals = result.items;
  } catch {
    // Sem conteúdo: mostra a casca do hub sem listagem
  }

  const breadcrumbs = [
    { name: 'Início', path: '/' },
    { name: label, path: `/${intentSlug}` },
  ];

  return (
    <main>
      <script {...jsonLdScript(ldGraph(breadcrumbLd(breadcrumbs)))} />

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

      <header style={{ marginBottom: 'var(--space-6)' }}>
        <h1>{label}</h1>
        <p className="lede">{description}</p>
      </header>

      <AdSlot slot="hub-top" />

      {signals.length > 0 ? (
        <section aria-label={`Conteúdo sobre ${label}`}>
          <div className="signal-grid">
            {signals.map((signal) => (
              <a
                key={signal.slug}
                href={signalUrl(signal)}
                className="signal-card"
              >
                <span className="tag" style={{ marginBottom: 'var(--space-3)', display: 'inline-block' }}>
                  {signal.kind}
                </span>
                <h3>{signal.title}</h3>
                <p>{signal.answer}</p>
              </a>
            ))}
          </div>
        </section>
      ) : (
        <p style={{ color: 'var(--ink-mute)' }}>
          Conteúdo em breve.
        </p>
      )}

      <IntentNav currentKey={intentKey} />
    </main>
  );
}
