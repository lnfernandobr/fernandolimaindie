import Link from 'next/link';
import { Glyph } from './Glyph.jsx';
import { signalUrl } from '@/lib/content/signal-url.js';
import { kindLabel } from '@/lib/content/taxonomy.js';

/** Card de um conteúdo já publicado. */
export function ContentCard({ signal, badge }) {
  return (
    <Link href={signalUrl(signal)} className="ccard">
      <span className="ccard-badge">{badge ?? kindLabel(signal.kind)}</span>
      <h3 className="ccard-title">{signal.title}</h3>
      <p className="ccard-note">{signal.answer}</p>
      <span className="ccard-arrow" aria-hidden="true">
        <Glyph name="arrow" size={18} />
      </span>
    </Link>
  );
}

/**
 * Card de conteúdo que está na pauta mas ainda não foi escrito.
 * Não é link de propósito: sem 404, sem página fina indexada.
 */
export function PlannedCard({ item }) {
  return (
    <article className="ccard is-planned" aria-label={`${item.title}, em breve`}>
      <span className="ccard-badge is-soon">
        <Glyph name="clock" size={13} />
        Em breve
      </span>
      <h3 className="ccard-title">{item.title}</h3>
      <p className="ccard-note">{item.note}</p>
    </article>
  );
}

/** Grade de cards. Usada por todos os hubs, pra todos ficarem iguais. */
export function CardGrid({ children, label }) {
  return (
    <div className="ccard-grid" role="list" aria-label={label}>
      {children}
    </div>
  );
}
