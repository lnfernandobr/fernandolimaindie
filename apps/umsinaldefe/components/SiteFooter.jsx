import Link from 'next/link';
import { Glyph } from './Glyph.jsx';

const COLS = [
  {
    h: 'Devocional',
    items: [
      { label: 'Devocional de hoje', href: '/salmo/91' },
      { label: 'Por intenção',       href: '/#intencoes' },
      { label: 'Manhã',              href: '/ansiedade'  },
      { label: 'Noite',              href: '/noite'      },
    ],
  },
  {
    h: 'Salmos',
    items: [
      { label: 'Salmo 91 · proteção', href: '/salmo/91'  },
      { label: 'Salmo 23 · o pastor', href: '/salmo/23'  },
      { label: 'Salmo 121 · caminho', href: '/salmo/121' },
      { label: 'Todos os salmos',     href: '/salmo'     },
    ],
  },
  {
    h: 'Orações',
    items: [
      { label: 'Para dormir em paz',     href: '/oracao/para-dormir-em-paz'     },
      { label: 'Da manhã',               href: '/oracao/da-manha'               },
      { label: 'Contra a ansiedade',     href: '/oracao/contra-a-ansiedade'     },
      { label: 'Todas as orações',       href: '/oracao'                        },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer-in">
        <div className="footer-brand">
          <Link className="brand" href="/">
            <span className="brand-star">✦</span>
            <span className="brand-name">Um Sinal de Fé</span>
          </Link>
          <p className="footer-tag t-soft">um sinal de fé todo dia</p>
          <Link className="btn btn-ghost footer-cta" href="#receber">
            <Glyph name="mail" size={16} /> Receber todo dia
          </Link>
        </div>
        <div className="footer-cols">
          {COLS.map((c) => (
            <div key={c.h} className="footer-col">
              <h4>{c.h}</h4>
              <ul>
                {c.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span className="t-faint">© {new Date().getFullYear()} Um Sinal de Fé · pt-BR</span>
        <span className="t-faint">Gratuito · interconfessional · feito com cuidado</span>
      </div>
    </footer>
  );
}
