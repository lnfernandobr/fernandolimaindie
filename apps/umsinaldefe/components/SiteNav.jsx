'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Glyph } from './Glyph.jsx';
import { navTree } from '@/lib/content/taxonomy.js';
import { INTENT_SLUGS, INTENT_LABELS } from '@/lib/content/intents.js';

const GROUPS = navTree();

// Intenções em destaque no painel "Orar". A lista completa vive em /mapa.
const FEATURED_INTENTS = ['anxiety', 'protection', 'gratitude', 'family', 'healing', 'night'];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState(null); // id do grupo aberto no desktop
  const [sheet, setSheet] = useState(false); // menu mobile
  const [openGroup, setOpenGroup] = useState(null); // sanfona do mobile
  const [theme, setTheme] = useState('day');
  const navRef = useRef(null);
  const closeTimer = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') || 'day');
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fecha tudo ao trocar de página
  useEffect(() => {
    setOpenMenu(null);
    setSheet(false);
    setOpenGroup(null);
  }, [pathname]);

  // Esc fecha, clique fora fecha
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      setOpenMenu(null);
      setSheet(false);
    };
    const onClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, []);

  // Trava o scroll do fundo enquanto o menu mobile está aberto
  useEffect(() => {
    document.body.classList.toggle('no-scroll', sheet);
    return () => document.body.classList.remove('no-scroll');
  }, [sheet]);

  const toggleTheme = () => {
    const next = theme === 'night' ? 'day' : 'night';
    const root = document.documentElement;
    root.classList.add('theme-switching');
    root.setAttribute('data-theme', next);
    void document.body.offsetHeight;
    setTheme(next);
    try { localStorage.setItem('usdf-theme', next); } catch (_) {}
    requestAnimationFrame(() => {
      void document.body.offsetHeight;
      root.classList.remove('theme-switching');
    });
  };

  // Hover com carência, pra não fechar quando o mouse cruza o vão até o painel
  const hoverOpen = (id) => {
    clearTimeout(closeTimer.current);
    setOpenMenu(id);
  };
  const hoverClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140);
  };

  const isCurrent = (href) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`} ref={navRef}>
      <div className="wrap nav-in">
        <Link className="brand" href="/">
          <span className="brand-star">✦</span>
          <span className="brand-name">Um Sinal de Fé</span>
        </Link>

        <nav className="nav-links" aria-label="Principal">
          {GROUPS.map((group) => {
            const open = openMenu === group.id;
            const active = group.sections.some((s) => isCurrent(`/${s.slug}`));
            return (
              <div
                key={group.id}
                className="nav-item"
                onMouseEnter={() => hoverOpen(group.id)}
                onMouseLeave={hoverClose}
              >
                <button
                  type="button"
                  className={`nav-trigger ${open ? 'is-open' : ''} ${active ? 'is-active' : ''}`}
                  aria-expanded={open}
                  aria-haspopup="true"
                  onClick={() => setOpenMenu(open ? null : group.id)}
                >
                  {group.label}
                  <Glyph name="chevronDown" size={14} className="nav-caret" />
                </button>

                {open && (
                  <div className="mega" onMouseEnter={() => hoverOpen(group.id)}>
                    <p className="mega-note">{group.note}</p>
                    <div className="mega-grid">
                      {group.sections.map((s) => (
                        <Link
                          key={s.slug}
                          href={`/${s.slug}`}
                          className="mega-link"
                          aria-current={isCurrent(`/${s.slug}`) ? 'page' : undefined}
                        >
                          <span className="mega-ic" aria-hidden="true">
                            <Glyph name={s.glyph} size={19} />
                          </span>
                          <span className="mega-body">
                            <span className="mega-label">{s.label}</span>
                            <span className="mega-sub">{s.navNote}</span>
                          </span>
                        </Link>
                      ))}
                    </div>

                    {group.id === 'orar' && (
                      <div className="mega-foot">
                        <span className="mega-foot-label">Por sentimento</span>
                        <div className="mega-chips">
                          {FEATURED_INTENTS.map((key) => (
                            <Link key={key} href={`/${INTENT_SLUGS[key]}`} className="mega-chip">
                              {INTENT_LABELS[key]}
                            </Link>
                          ))}
                          <Link href="/mapa" className="mega-chip is-more">
                            Ver todos
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="nav-actions">
          <button
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'night' ? 'Modo dia' : 'Modo noite'}
            title={theme === 'night' ? 'Modo dia' : 'Modo noite'}
          >
            <Glyph name={theme === 'night' ? 'sunUi' : 'moonUi'} size={19} />
          </button>
          <Link className="btn btn-primary nav-cta" href="/versiculo-do-dia">
            Versículo de hoje
          </Link>
          <button
            className="icon-btn nav-burger"
            onClick={() => setSheet((o) => !o)}
            aria-label={sheet ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={sheet}
          >
            <Glyph name={sheet ? 'close' : 'grid'} size={20} />
          </button>
        </div>
      </div>

      {sheet && (
        <div className="nav-sheet">
          {GROUPS.map((group) => {
            const open = openGroup === group.id;
            return (
              <div key={group.id} className="sheet-group">
                <button
                  type="button"
                  className={`sheet-trigger ${open ? 'is-open' : ''}`}
                  aria-expanded={open}
                  onClick={() => setOpenGroup(open ? null : group.id)}
                >
                  {group.label}
                  <Glyph name="chevronDown" size={16} className="sheet-caret" />
                </button>
                {open && (
                  <div className="sheet-links">
                    {group.sections.map((s) => (
                      <Link key={s.slug} href={`/${s.slug}`} className="sheet-link">
                        <span className="mega-ic" aria-hidden="true">
                          <Glyph name={s.glyph} size={17} />
                        </span>
                        <span>
                          <span className="mega-label">{s.label}</span>
                          <span className="mega-sub">{s.navNote}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <Link href="/mapa" className="sheet-plain">Mapa do site</Link>
          <Link className="btn btn-gold sheet-cta" href="/versiculo-do-dia">
            Versículo de hoje
          </Link>
        </div>
      )}
    </header>
  );
}
