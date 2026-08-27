import Link from 'next/link';
import { navTree } from '@/lib/content/taxonomy.js';
import { INTENT_SLUGS, INTENT_LABELS, INTENT_DESCRIPTIONS } from '@/lib/content/intents.js';
import { listSectionSignals } from '@/components/SectionHub.jsx';
import { roadmapForSection } from '@/lib/content/roadmap.js';
import { buildMetadata } from '@/lib/seo/metadata.js';
import { Breadcrumbs } from '@/components/Breadcrumbs.jsx';
import { Glyph } from '@/components/Glyph.jsx';

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: 'Mapa do site',
  description:
    'Todas as seções do Um Sinal de Fé em um lugar: Bíblia, salmos, orações, devocionais, estudos, frases e as páginas por sentimento.',
  path: '/mapa',
});

const GROUPS = navTree();

export default async function MapaPage() {
  // Conta o que já existe em cada seção, pra o mapa nunca mentir sobre o acervo.
  const counts = Object.fromEntries(
    await Promise.all(
      GROUPS.flatMap((g) => g.sections).map(async (s) => [
        s.slug,
        {
          published: (await listSectionSignals(s)).length,
          planned: roadmapForSection(s.slug).length,
        },
      ]),
    ),
  );

  return (
    <main className="hub">
      <Breadcrumbs
        trail={[
          { name: 'Início', path: '/' },
          { name: 'Mapa do site', path: '/mapa' },
        ]}
      />

      <header className="hub-head">
        <span className="hub-icon" aria-hidden="true">
          <Glyph name="grid" size={26} />
        </span>
        <h1 className="display hub-title">Mapa do site</h1>
        <p className="lede hub-lead">
          Tudo o que existe aqui, em um lugar só. Use como atalho pra qualquer seção.
        </p>
      </header>

      {GROUPS.map((group) => (
        <section key={group.id} className="map-group" aria-labelledby={`grp-${group.id}`}>
          <h2 id={`grp-${group.id}`} className="map-group-title">
            {group.label}
          </h2>
          <p className="t-faint map-group-note">{group.note}</p>
          <ul className="map-list">
            {group.sections.map((s) => {
              const c = counts[s.slug] ?? { published: 0, planned: 0 };
              return (
                <li key={s.slug}>
                  <Link href={`/${s.slug}`} className="map-link">
                    <span className="mega-ic" aria-hidden="true">
                      <Glyph name={s.glyph} size={18} />
                    </span>
                    <span className="map-link-body">
                      <span className="mega-label">{s.label}</span>
                      <span className="mega-sub">{s.navNote}</span>
                    </span>
                    <span className="map-count t-faint">
                      {c.published > 0 ? `${c.published}` : c.planned > 0 ? 'em breve' : ''}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <section className="map-group" aria-labelledby="grp-sentimento">
        <h2 id="grp-sentimento" className="map-group-title">
          Por sentimento
        </h2>
        <p className="t-faint map-group-note">
          Quando você sabe o que está sentindo, mas não sabe o que ler.
        </p>
        <ul className="map-list">
          {Object.entries(INTENT_SLUGS).map(([key, slug]) => (
            <li key={key}>
              <Link href={`/${slug}`} className="map-link">
                <span className="map-link-body">
                  <span className="mega-label">{INTENT_LABELS[key]}</span>
                  <span className="mega-sub">{INTENT_DESCRIPTIONS[key]}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
