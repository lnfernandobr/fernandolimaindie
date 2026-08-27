import { getVerseOfDayData } from '@/lib/content/verse-of-day.js';
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

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: 'Versículo do dia de hoje: uma palavra da Bíblia pra hoje',
  description:
    'O versículo do dia, atualizado todo dia, com uma reflexão curta. Uma palavra da Bíblia pra começar o dia com fé.',
  path: '/versiculo-do-dia',
});

export default async function VerseOfDayPage() {
  const { verse: today, others } = await getVerseOfDayData();
  const path = '/versiculo-do-dia';

  const dateStr = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const breadcrumbs = [
    { name: 'Início', path: '/' },
    { name: 'Versículo do dia', path },
  ];

  // Sem conteúdo ainda: casca + "em breve" (o cron enche conforme gera a Bíblia).
  if (!today) {
    return (
      <main>
        <script {...jsonLdScript(ldGraph(breadcrumbLd(breadcrumbs)))} />
        <nav aria-label="Navegação estrutural" className="breadcrumb">
          <ol>
            <li><a href="/">Início</a></li>
            <li><span aria-current="page">Versículo do dia</span></li>
          </ol>
        </nav>
        <header style={{ marginBottom: 'var(--space-4)' }}>
          <h1>Versículo do dia</h1>
          <p className="t-faint" style={{ textTransform: 'capitalize' }}>{dateStr}</p>
        </header>
        <p style={{ color: 'var(--ink-mute)' }}>
          Conteúdo em breve. Enquanto isso, veja os{' '}
          <a href="/biblia">versículos por tema</a>.
        </p>
        <IntentNav />
      </main>
    );
  }

  const faq = [
    {
      question: 'Qual o versículo do dia de hoje?',
      answer: `O versículo de hoje é ${today.ref}: "${today.text}"`,
    },
    {
      question: 'Como funciona o versículo do dia?',
      answer:
        'Todo dia esta página mostra um versículo diferente da Bíblia. É uma forma simples de começar o dia com uma palavra de fé.',
    },
  ];

  const nodes = [
    breadcrumbLd(breadcrumbs),
    articleLd({
      headline: 'Versículo do dia',
      description: `${today.ref}: ${today.text}`,
      path,
    }),
    speakableLd(['#versiculo-hoje']),
    faqLd(faq),
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
        <header style={{ marginBottom: 'var(--space-4)' }}>
          <h1>Versículo do dia</h1>
          <p className="t-faint" style={{ textTransform: 'capitalize' }}>{dateStr}</p>
        </header>

        <section id="versiculo-hoje" className="verse verse-today">
          <blockquote className="scripture">&ldquo;{today.text}&rdquo;</blockquote>
          <figcaption className="verse-ref">{today.ref}</figcaption>
          {today.thought && <p className="verse-thought t-soft">{today.thought}</p>}
        </section>

        <div className="signal-actions">
          <ShareButton title={`Versículo do dia: ${today.ref}`} url={absoluteUrl(path)} />
        </div>

        <AdSlot slot="top-article" />

        {others.length > 0 && (
          <section id="colecao" className="chunk">
            <h2>Mais versículos pra meditar</h2>
            <div className="verse-list">
              {others.map((vrs) => (
                <figure className="verse" key={vrs.ref}>
                  <blockquote className="scripture">&ldquo;{vrs.text}&rdquo;</blockquote>
                  <figcaption className="verse-ref">{vrs.ref}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        <SemanticFAQ entries={faq} />

        <section className="chunk">
          <h2>Para ir além</h2>
          <p>
            Procurando um tema específico? Veja os{' '}
            <a href="/biblia">versículos por tema</a> ou o{' '}
            <a href="/devocional">devocional de hoje</a>.
          </p>
        </section>
      </article>

      <IntentNav />
    </main>
  );
}
