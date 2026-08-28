import Link from 'next/link';
import { Glyph } from './Glyph.jsx';
import { signalUrl } from '@/lib/content/signal-url.js';
import { INTENT_LABELS } from '@/lib/content/intents.js';
import { BrandMark } from './BrandMark.jsx';

const psalmNumber = (slug) => slug.replace(/^salmo-/, '');

function PsalmCard({ s, featured }) {
  return (
    <Link
      href={signalUrl(s)}
      className={`psalm-card reveal ${featured ? 'is-featured' : ''}`}
      style={{ textDecoration: 'none' }}
    >
      <div className="psalm-top">
        <span className="psalm-num">{psalmNumber(s.slug)}</span>
        <span className="psalm-tag">{INTENT_LABELS[s.intent] ?? 'Salmo'}</span>
      </div>
      <h3 className="psalm-title display">{s.title}</h3>
      <p className="psalm-line scripture">&ldquo;{s.answer}&rdquo;</p>
      <div className="psalm-foot">
        <span className="psalm-go">
          Ler <span className="psalm-go-arrow"><Glyph name="arrow" size={15} /></span>
        </span>
      </div>
    </Link>
  );
}

/**
 * Salmos em destaque na home. Recebe signals (kind=psalm) da API — só linka o
 * que existe. Se não houver nenhum, a home esconde a seção (ver app/page.jsx).
 */
export function FeaturedPsalms({ psalms = [] }) {
  if (!psalms.length) return null;
  const [first, ...rest] = psalms;

  return (
    <section className="section psalms paper-2" id="salmos">
      <div className="wrap">
        <div className="sec-head reveal">
          <div>
            <p className="eyebrow"><BrandMark size={13} className="star" /> Salmos</p>
            <h2 className="display sec-title">Salmos para rezar devagar</h2>
          </div>
          <p className="sec-lead t-soft">
            Uma frase de cada vez. Versos que atravessam séculos como abrigo, coragem e descanso.
          </p>
        </div>

        <div className="psalm-grid">
          <PsalmCard s={first} featured />
          <div className="psalm-rest">
            {rest.map((s) => (
              <PsalmCard key={s.slug} s={s} />
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
