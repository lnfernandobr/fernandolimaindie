import Link from 'next/link';
import { breadcrumbLd, ldGraph, jsonLdScript } from '@/lib/seo/jsonld.js';

/**
 * Trilha de navegação. Renderiza a marcação visual e o JSON-LD de uma vez só,
 * pra não haver como uma página ter uma sem a outra.
 *
 * trail: [{ name, path }] do início até a página atual (inclusive).
 */
export function Breadcrumbs({ trail }) {
  if (!trail?.length) return null;

  return (
    <>
      <script {...jsonLdScript(ldGraph(breadcrumbLd(trail)))} />
      <nav aria-label="Navegação estrutural" className="crumb">
        {trail.map((crumb, i) => {
          const last = i === trail.length - 1;
          return (
            <span key={crumb.path} className="crumb-item">
              {i > 0 && <span className="crumb-sep" aria-hidden="true">/</span>}
              {last ? (
                <span aria-current="page">{crumb.name}</span>
              ) : (
                <Link href={crumb.path}>{crumb.name}</Link>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}
