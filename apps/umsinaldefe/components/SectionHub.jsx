import { notFound } from 'next/navigation';
import { listSignals } from '@/lib/content/api.js';
import { getSection } from '@/lib/content/taxonomy.js';
import { roadmapForSection } from '@/lib/content/roadmap.js';
import { buildMetadata } from '@/lib/seo/metadata.js';
import { Breadcrumbs } from './Breadcrumbs.jsx';
import { CardGrid, ContentCard, PlannedCard } from './ContentCard.jsx';
import { Glyph } from './Glyph.jsx';
import { AdSlot } from './AdSlot.jsx';
import { IntentNav } from './IntentNav.jsx';

/** Todos os kinds que a seção lista (o principal mais os agregados). */
const kindsOf = (section) => [section.kind, ...(section.extraKinds ?? [])].filter(Boolean);

/** Conteúdos publicados de uma seção. */
export async function listSectionSignals(section, limit = 100) {
  if (!section.kind) return [];
  const { items } = await listSignals({ kinds: kindsOf(section), limit });
  return items;
}

/**
 * Metadados do hub. Um hub sem nenhum conteúdo publicado sai do índice: página
 * só com card "em breve" é conteúdo fino, e foi isso que encheu o Search Console
 * de "não indexada" da última vez. Ele volta pro índice sozinho no primeiro post.
 */
export async function sectionMetadata(slug) {
  const section = getSection(slug);
  if (!section) return {};
  const published = await listSectionSignals(section, 1);

  return buildMetadata({
    title: section.seoTitle ?? section.title,
    description: section.seoDescription ?? section.lead,
    path: `/${section.slug}`,
    noIndex: published.length === 0,
  });
}

/**
 * Hub genérico de seção. Uma seção nova não precisa de layout novo: declare em
 * lib/content/taxonomy.js e aponte a rota pra cá.
 */
export async function SectionHub({ slug, children }) {
  const section = getSection(slug);
  if (!section) notFound();

  const published = await listSectionSignals(section);
  const planned = roadmapForSection(section.slug);

  const trail = [
    { name: 'Início', path: '/' },
    { name: section.label, path: `/${section.slug}` },
  ];

  return (
    <main className="hub">
      <Breadcrumbs trail={trail} />

      <header className="hub-head">
        <span className="hub-icon" aria-hidden="true">
          <Glyph name={section.glyph} size={26} />
        </span>
        <h1 className="display hub-title">{section.title}</h1>
        <p className="lede hub-lead">{section.lead}</p>
        {published.length > 0 && (
          <p className="hub-count t-faint">
            {published.length} {published.length === 1 ? 'publicado' : 'publicados'}
            {planned.length > 0 && ` · ${planned.length} a caminho`}
          </p>
        )}
      </header>

      {children}

      <AdSlot slot="hub-top" />

      {published.length > 0 && (
        <section aria-label={`Conteúdo de ${section.label}`} className="hub-block">
          <CardGrid label={section.label}>
            {published.map((signal) => (
              <ContentCard key={signal.slug} signal={signal} />
            ))}
          </CardGrid>
        </section>
      )}

      {planned.length > 0 && (
        <section aria-label="Em breve" className="hub-block">
          <div className="hub-block-head">
            <p className="section-caption">Em breve nesta seção</p>
            <p className="t-faint hub-block-note">
              Já está na fila de publicação. Nada aqui é link quebrado.
            </p>
          </div>
          <CardGrid label="Conteúdo em breve">
            {planned.map((item) => (
              <PlannedCard key={item.slug} item={item} />
            ))}
          </CardGrid>
        </section>
      )}

      {published.length === 0 && planned.length === 0 && (
        <p className="hub-empty t-soft">
          Esta seção está sendo preparada. Volte em alguns dias.
        </p>
      )}

      <IntentNav />
    </main>
  );
}
