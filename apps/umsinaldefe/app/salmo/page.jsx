import { listSignals } from '@/lib/content/api.js';
import { signalUrl } from '@/lib/content/signal-url.js';
import { buildMetadata } from '@/lib/seo/metadata.js';
import { breadcrumbLd, ldGraph, jsonLdScript } from '@/lib/seo/jsonld.js';
import { AdSlot } from '@/components/AdSlot.jsx';
import { IntentNav } from '@/components/IntentNav.jsx';

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: 'Salmos comentados em português para oração diária',
  description:
    'Salmos bíblicos comentados e em áudio. Salmo 91 (proteção), Salmo 23 (paz), Salmo 27 (coragem) e outros, em português, pra rezar todo dia.',
  path: '/salmo',
});

export default async function PsalmListPage() {
  let signals = [];
  try {
    const result = await listSignals({ kind: 'psalm', limit: 50 });
    signals = result.items;
  } catch {
    // API unavailable at build time
  }

  const breadcrumbs = [
    { name: 'Início', path: '/' },
    { name: 'Salmos', path: '/salmo' },
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
        <h1>Salmos</h1>
        <p className="lede">
          Salmos bíblicos comentados em português, pra oração diária, pra momentos de fé,
          proteção, gratidão e consolo.
        </p>
      </header>

      <AdSlot slot="hub-top" />

      {signals.length > 0 ? (
        <section aria-label="Salmos">
          <div className="signal-grid">
            {signals.map((signal) => (
              <a key={signal.slug} href={signalUrl(signal)} className="signal-card">
                <span
                  className="tag"
                  style={{ marginBottom: 'var(--space-3)', display: 'inline-block' }}
                >
                  salmo
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
