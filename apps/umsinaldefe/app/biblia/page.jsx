import { listSignals } from '@/lib/content/api.js';
import { signalUrl } from '@/lib/content/signal-url.js';
import { buildMetadata } from '@/lib/seo/metadata.js';
import { breadcrumbLd, ldGraph, jsonLdScript } from '@/lib/seo/jsonld.js';
import { AdSlot } from '@/components/AdSlot.jsx';
import { IntentNav } from '@/components/IntentNav.jsx';

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: 'Bíblia: versículos por tema em português',
  description:
    'Versículos da Bíblia organizados por tema: amor, família, casamento, cura, gratidão, esperança, fé, proteção, perdão e ansiedade. Pra ler, refletir e rezar.',
  path: '/biblia',
});

export default async function BibliaIndexPage() {
  let topics = [];
  try {
    const result = await listSignals({ kind: 'verse_collection', limit: 100 });
    topics = result.items;
  } catch {
    // API indisponível: mostra a casca sem listagem
  }

  const breadcrumbs = [
    { name: 'Início', path: '/' },
    { name: 'Bíblia', path: '/biblia' },
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
        <h1>Versículos por tema</h1>
        <p className="lede">
          A Bíblia tem uma palavra pra cada momento. Reunimos versículos por tema, pra você
          encontrar logo o que precisa: pra amar, agradecer, ter fé, acalmar o coração ou
          rezar pela família.
        </p>
      </header>

      <p style={{ marginBottom: 'var(--space-5)' }}>
        <a className="btn btn-primary" href="/versiculo-do-dia" style={{ textDecoration: 'none' }}>
          Ver o versículo do dia de hoje
        </a>
      </p>

      <AdSlot slot="hub-top" />

      {topics.length === 0 ? (
        <p style={{ color: 'var(--ink-mute)' }}>Conteúdo em breve.</p>
      ) : (
        <section aria-label="Temas">
          <div className="signal-grid">
            {topics.map((t) => (
              <a key={t.slug} href={signalUrl(t)} className="signal-card">
                <span
                  className="tag"
                  style={{ marginBottom: 'var(--space-3)', display: 'inline-block' }}
                >
                  Bíblia
                </span>
                <h3>{t.title}</h3>
                <p>{t.answer}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      <IntentNav />
    </main>
  );
}
