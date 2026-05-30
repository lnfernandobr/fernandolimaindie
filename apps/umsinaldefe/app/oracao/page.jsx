import { listSignals } from '@/lib/content/api.js';
import { signalUrl } from '@/lib/content/signal-url.js';
import { INTENT_LABELS } from '@/lib/content/intents.js';
import { buildMetadata } from '@/lib/seo/metadata.js';
import { breadcrumbLd, ldGraph, jsonLdScript } from '@/lib/seo/jsonld.js';
import { AdSlot } from '@/components/AdSlot.jsx';
import { IntentNav } from '@/components/IntentNav.jsx';

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: 'Orações por intenção e por santos, em português',
  description:
    'Orações curtas e completas em português, pra ansiedade, sono, proteção, família, fé e muito mais. Inclui orações a santos e novenas.',
  path: '/oracao',
});

export default async function PrayerListPage() {
  let signals = [];
  try {
    const result = await listSignals({ kind: 'prayer', limit: 50 });
    signals = result.items;
  } catch {
    // API unavailable at build time
  }

  const breadcrumbs = [
    { name: 'Início', path: '/' },
    { name: 'Orações', path: '/oracao' },
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
        <h1>Orações</h1>
        <p className="lede">
          Orações curtas e completas em português, por intenção (ansiedade, sono, proteção,
          família) e por santos. Pra rezar agora ou guardar pro momento certo.
        </p>
      </header>

      <AdSlot slot="hub-top" />

      {signals.length > 0 ? (
        <section aria-label="Orações">
          <div className="signal-grid">
            {signals.map((signal) => (
              <a key={signal.slug} href={signalUrl(signal)} className="signal-card">
                <span
                  className="tag"
                  style={{ marginBottom: 'var(--space-3)', display: 'inline-block' }}
                >
                  {INTENT_LABELS[signal.intent] ?? 'oração'}
                </span>
                <h3>{signal.title}</h3>
                <p>{signal.answer}</p>
              </a>
            ))}
          </div>
        </section>
      ) : (
        <p style={{ color: 'var(--ink-mute)' }}>Conteúdo em breve.</p>
      )}

      <IntentNav />
    </main>
  );
}
