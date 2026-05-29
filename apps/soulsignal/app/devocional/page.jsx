import { listSignals } from '@/lib/content/api.js';
import { signalUrl } from '@/lib/content/signal-url.js';
import { INTENT_LABELS } from '@/lib/content/intents.js';
import { buildMetadata } from '@/lib/seo/metadata.js';
import { breadcrumbLd, ldGraph, jsonLdScript } from '@/lib/seo/jsonld.js';
import { AdSlot } from '@/components/AdSlot.jsx';
import { IntentNav } from '@/components/IntentNav.jsx';

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: 'Devocionais — reflexão e oração para o dia a dia',
  description:
    'Devocionais cristãos curtos em português. Reflexão, versículo e oração — pra começar o dia com fé, lidar com ansiedade, encontrar esperança e crescer espiritualmente.',
  path: '/devocional',
});

export default async function DevotionalListPage() {
  let signals = [];
  try {
    const result = await listSignals({ kind: 'devotional', limit: 50 });
    signals = result.items;
  } catch {
    // API unavailable at build time
  }

  const breadcrumbs = [
    { name: 'Início', path: '/' },
    { name: 'Devocionais', path: '/devocional' },
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
        <h1>Devocionais</h1>
        <p className="lede">
          Uma reflexão curta com versículo e oração — pra começar o dia com fé, atravessar
          momentos difíceis e crescer espiritualmente, um dia de cada vez.
        </p>
      </header>

      <AdSlot slot="hub-top" />

      {signals.length > 0 ? (
        <section aria-label="Devocionais">
          <div className="signal-grid">
            {signals.map((signal) => (
              <a key={signal.slug} href={signalUrl(signal)} className="signal-card">
                <span
                  className="tag"
                  style={{ marginBottom: 'var(--space-3)', display: 'inline-block' }}
                >
                  {INTENT_LABELS[signal.intent] ?? 'devocional'}
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
