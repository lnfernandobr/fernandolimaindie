'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Glyph } from './Glyph.jsx';

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState('day');

  useEffect(() => {
    const saved = document.documentElement.getAttribute('data-theme') || 'day';
    setTheme(saved);

    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const links = [
    { href: '/devocional', label: 'Devocional' },
    { href: '/salmo',      label: 'Salmos'     },
    { href: '/oracao',     label: 'Orações'    },
  ];

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="wrap nav-in">
        <Link className="brand" href="/">
          <span className="brand-star">✦</span>
          <span className="brand-name">Um Sinal de Fé</span>
        </Link>

        <nav className="nav-links" aria-label="Principal">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ))}
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
          <Link className="btn btn-primary nav-cta" href="/salmo/91">
            Devocional de hoje
          </Link>
          <button
            className="icon-btn nav-burger"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <Glyph name={open ? 'close' : 'arrow'} size={20} />
          </button>
        </div>
      </div>

      {open && (
        <div className="nav-sheet">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
          <Link className="btn btn-gold" href="/salmo/91" onClick={() => setOpen(false)}>
            Devocional de hoje
          </Link>
        </div>
      )}
    </header>
  );
}
