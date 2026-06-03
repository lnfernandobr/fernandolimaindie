import Link from 'next/link';

// Só hubs e páginas de sentimento (sempre renderizam). Nada de deep-link pra
// conteúdo específico, que pode ainda não ter sido gerado pelo cron (evita 404).
const COLS = [
  {
    h: 'Conteúdo',
    items: [
      { label: 'Versículo do dia', href: '/versiculo-do-dia' },
      { label: 'Devocional',       href: '/devocional'       },
      { label: 'Salmos',           href: '/salmo'            },
      { label: 'Orações',          href: '/oracao'           },
    ],
  },
  {
    h: 'Explorar',
    items: [
      { label: 'Versículos por tema', href: '/biblia' },
      { label: 'Blog',                href: '/blog'   },
    ],
  },
  {
    h: 'Por sentimento',
    items: [
      { label: 'Ansiedade', href: '/ansiedade' },
      { label: 'Medo',      href: '/medo'      },
      { label: 'Proteção',  href: '/protecao'  },
      { label: 'Gratidão',  href: '/gratidao'  },
      { label: 'Família',   href: '/familia'   },
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
