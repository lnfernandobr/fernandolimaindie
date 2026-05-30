import Link from 'next/link';
import { Glyph } from './Glyph.jsx';
import { AudioPlayer } from './AudioPlayer.jsx';
import { TODAY } from '@/lib/design-data.js';

function getTodayLabel() {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function Hero({ audioEnabled = false }) {
  const d = TODAY;
  const dateStr = getTodayLabel();
  const psalmNum = d.ref.replace(/Salmo\s*/i, '').replace(/,.*/, '');

  return (
    <section className="hero">
      <div className="wrap hero-in">
        <div className="hero-text reveal">
          <p className="eyebrow hero-eyebrow">
            <span className="star">✦</span> Devocional de hoje
            <span className="hero-date">· {dateStr}</span>
          </p>

          <h1 className="scripture hero-scripture">
            &ldquo;{d.scripture}&rdquo;
          </h1>

          <p className="hero-ref">
            {d.ref} · <span className="t-gold">{d.theme}</span>
          </p>

          <p className="hero-reflection t-soft">{d.reflection}</p>

          <div className="hero-cta">
            <Link className="btn btn-primary" href="/salmo/91">
              Ler o devocional <span className="cta-mins">{d.readMins} min</span>
            </Link>
            <a className="btn btn-ghost" href="#intencoes">
              Onde está seu coração?
            </a>
          </div>

          {audioEnabled && (
            <div className="hero-audio">
              <AudioPlayer
                title={d.audio.title}
                subtitle={d.audio.subtitle}
                duration={d.audio.duration}
                src="/api/tts/salmo-91"
                variant="feature"
              />
            </div>
          )}
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
              <span className="dcard-kicker">Salmo do dia</span>
              <span className="dcard-num">{psalmNum}</span>
              <span className="dcard-star">✦</span>
              <p className="dcard-theme">{d.theme}</p>
              <p className="dcard-verse">&ldquo;à sombra do Todo-Poderoso&rdquo;</p>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
