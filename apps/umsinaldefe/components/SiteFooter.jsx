import Link from 'next/link';
import { Glyph } from './Glyph.jsx';
import { siteConfig } from '@/lib/site-config.js';
import { navTree } from '@/lib/content/taxonomy.js';
import { INTENT_SLUGS, INTENT_LABELS } from '@/lib/content/intents.js';
import { BrandMark } from './BrandMark.jsx';

// As colunas saem do registro de seções: seção nova aparece aqui sozinha.
const GROUPS = navTree();

const FOOTER_INTENTS = ['anxiety', 'protection', 'gratitude', 'family', 'healing', 'grief'];

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer-in">
        <div className="footer-brand">
          <Link className="brand" href="/">
            <BrandMark size={19} className="brand-star" />
            <span className="brand-name">Um Sinal de Fé</span>
          </Link>
          <p className="footer-tag t-soft">um sinal de fé todo dia</p>
          <div className="footer-social">
            <a
              href={siteConfig.social.youtube}
              target="_blank"
              rel="me noopener noreferrer"
              aria-label="YouTube do Um Sinal de Fé"
              title="YouTube"
            >
              <Glyph name="youtube" size={20} />
            </a>
          </div>
        </div>

        <div className="footer-cols">
          {GROUPS.map((group) => (
            <div key={group.id} className="footer-col">
              <h4>{group.label}</h4>
              <ul>
                {group.sections.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/${s.slug}`}>{s.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="footer-col">
            <h4>Por sentimento</h4>
            <ul>
              {FOOTER_INTENTS.map((key) => (
                <li key={key}>
                  <Link href={`/${INTENT_SLUGS[key]}`}>{INTENT_LABELS[key]}</Link>
                </li>
              ))}
              <li>
                <Link href="/mapa">Mapa do site</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="wrap footer-bottom">
        <span className="t-faint">© {new Date().getFullYear()} Um Sinal de Fé · pt-BR</span>
        <span className="t-faint">Gratuito · interconfessional · feito com cuidado</span>
      </div>
    </footer>
  );
}
