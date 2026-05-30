import Link from 'next/link';
import { Glyph } from './Glyph.jsx';

const COLS = [
  {
    h: 'Bíblia',
    items: [
      { label: 'Versículos sobre o amor',     href: '/biblia/amor'      },
      { label: 'Versículos sobre a família',  href: '/biblia/familia'   },
      { label: 'Versículos sobre ansiedade',  href: '/biblia/ansiedade' },
      { label: 'Versículos por tema',         href: '/biblia'           },
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
      { label: 'Pelos filhos',           href: '/oracao/pelos-filhos'       },
      { label: 'Para dormir em paz',     href: '/oracao/para-dormir-em-paz' },
      { label: 'São Miguel Arcanjo',     href: '/oracao/sao-miguel-arcanjo' },
      { label: 'Todas as orações',       href: '/oracao'                    },
    ],
  },
  {
    h: 'Blog',
    items: [
      { label: 'Vencer a ansiedade com fé', href: '/blog/como-vencer-a-ansiedade-com-fe' },
      { label: 'Como ler a Bíblia',         href: '/blog/como-ler-a-biblia-do-zero'      },
      { label: 'Fortalecer o casamento',    href: '/blog/como-fortalecer-o-casamento-com-fe' },
      { label: 'Todos os artigos',          href: '/blog'                                },
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
