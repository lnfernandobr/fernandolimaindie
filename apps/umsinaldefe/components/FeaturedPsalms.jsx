import Link from 'next/link';
import { Glyph } from './Glyph.jsx';
import { PSALMS } from '@/lib/design-data.js';

const fmt = (s) => {
  s = Math.max(0, Math.round(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

function PsalmCard({ p, featured }) {
  return (
    <Link href={`/salmo/${p.num}`} className={`psalm-card reveal ${featured ? 'is-featured' : ''}`} style={{ textDecoration: 'none' }}>
      <div className="psalm-top">
        <span className="psalm-num">{p.num}</span>
        <span className="psalm-tag">{p.tag}</span>
      </div>
      <h3 className="psalm-title display">Salmo {p.num}</h3>
      <p className="psalm-sub">{p.title}</p>
      <p className="psalm-line scripture">&ldquo;{p.line}&rdquo;</p>
      {featured && <p className="psalm-blurb t-soft">{p.blurb}</p>}
      <div className="psalm-foot">
        <span className="psalm-audio">
          <Glyph name="headphones" size={15} /> {fmt(p.audio)}
        </span>
        <span className="psalm-go">
          Ler <span className="psalm-go-arrow"><Glyph name="arrow" size={15} /></span>
        </span>
      </div>
    </Link>
  );
}

export function FeaturedPsalms() {
  const psalms = PSALMS;
  return (
    <section className="section psalms paper-2" id="salmos">
      <div className="wrap">
        <div className="sec-head reveal">
          <div>
            <p className="eyebrow"><span className="star">✦</span> Salmos</p>
            <h2 className="display sec-title">Salmos para rezar devagar</h2>
          </div>
          <p className="sec-lead t-soft">
            Uma frase de cada vez. Versos que atravessam séculos como abrigo, coragem e descanso.
          </p>
        </div>

        <div className="psalm-grid">
          <PsalmCard p={psalms[0]} featured />
          <div className="psalm-rest">
            {psalms.slice(1).map((p) => (
              <PsalmCard key={p.num} p={p} />
            ))}
          </div>
        </div>

        <div className="sec-more reveal">
          <Link href="/salmo" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
            Ver todos os salmos <Glyph name="arrow" size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
