'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Glyph } from './Glyph.jsx';
import { INTENTIONS } from '@/lib/design-data.js';

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function Intentions() {
  const [q, setQ] = useState('');
  const router = useRouter();
  const filtered = INTENTIONS.filter((i) => norm(`${i.label} ${i.note}`).includes(norm(q)));

  return (
    <section className="section intentions" id="intencoes">
      <div className="wrap">
        <div className="sec-head reveal">
          <div>
            <p className="eyebrow"><span className="star">✦</span> Por intenção</p>
            <h2 className="display sec-title">Onde está seu coração hoje?</h2>
          </div>
          <p className="sec-lead t-soft">
            Escolha o que você está sentindo. A gente te leva pra um salmo, uma oração e uma
            palavra feita pra esse momento.
          </p>
        </div>

        <div className="int-search reveal">
          <Glyph name="search" size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ansiedade, sono, gratidão, proteção…"
            aria-label="Buscar por intenção"
          />
          {q && (
            <button className="int-clear" onClick={() => setQ('')} aria-label="Limpar">
              <Glyph name="close" size={16} />
            </button>
          )}
        </div>

        <div className="int-grid">
          {filtered.map((i, idx) => (
            <button
              key={i.slug}
              className="int-card reveal"
              style={{ transitionDelay: `${Math.min(idx * 30, 300)}ms` }}
              onClick={() => router.push(`/${i.slug}`)}
            >
              <span className="int-glyph">
                <Glyph name={i.glyph} size={26} />
              </span>
              <span className="int-label">{i.label}</span>
              <span className="int-note">{i.note}</span>
              <span className="int-arrow">
                <Glyph name="arrow" size={16} />
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="int-empty t-faint">
              Nada encontrado pra &ldquo;{q}&rdquo;. Tenta outra palavra, ou{' '}
              <button className="linkish" onClick={() => setQ('')}>ver todas</button>.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
