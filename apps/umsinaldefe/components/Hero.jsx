import Link from 'next/link';
import { getVerseOfDay } from '@/lib/content/verse-of-day.js';

function getTodayLabel() {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function Hero() {
  const v = getVerseOfDay();
  const dateStr = getTodayLabel();
  const shortVerse = v.text.length > 64 ? `${v.text.slice(0, 64)}…` : v.text;

  return (
    <section className="hero">
      <div className="wrap hero-in">
        <div className="hero-text reveal">
          <p className="eyebrow hero-eyebrow">
            <span className="star">✦</span> Versículo de hoje
            <span className="hero-date">· {dateStr}</span>
          </p>

          <h1 className="scripture hero-scripture">
            &ldquo;{v.text}&rdquo;
          </h1>

          <p className="hero-ref">
            {v.ref}
          </p>

          <p className="hero-reflection t-soft">{v.thought}</p>

          <div className="hero-cta">
            <Link className="btn btn-primary" href="/versiculo-do-dia">
              Ver o versículo de hoje
            </Link>
            <a className="btn btn-ghost" href="#intencoes">
              Onde está seu coração?
            </a>
          </div>
        </div>

        <div className="hero-art reveal">
          <figure className="dcard">
            <div className="dcard-glow" aria-hidden="true" />
            <div className="dcard-rays" aria-hidden="true">
              <span /><span /><span /><span />
            </div>
            <div className="dcard-stars" aria-hidden="true">
              <i style={{ top: '16%', left: '20%' }} />
              <i style={{ top: '26%', left: '78%' }} />
              <i style={{ top: '70%', left: '14%' }} />
              <i style={{ top: '82%', left: '82%' }} />
            </div>
            <figcaption className="dcard-in">
              <span className="dcard-kicker">Versículo do dia</span>
              <span className="dcard-star">✦</span>
              <p className="dcard-theme">{v.ref}</p>
              <p className="dcard-verse">&ldquo;{shortVerse}&rdquo;</p>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
