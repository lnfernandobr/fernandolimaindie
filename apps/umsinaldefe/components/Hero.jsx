import Link from 'next/link';
import { BrandMark } from './BrandMark.jsx';

function getTodayLabel() {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Hero da home. Recebe o versículo do dia (da API) via prop. Sem conteúdo
 * estático: se não houver versículo ainda, mostra uma casca limpa de boas-vindas.
 */
export function Hero({ verse = null }) {
  const dateStr = getTodayLabel();
  const shortVerse = verse && verse.text.length > 64 ? `${verse.text.slice(0, 64)}…` : verse?.text;

  return (
    <section className="hero">
      <div className="wrap hero-in">
        <div className="hero-text reveal">
          <p className="eyebrow hero-eyebrow">
            <BrandMark size={13} className="star" /> Versículo de hoje
            <span className="hero-date">· {dateStr}</span>
          </p>

          {verse ? (
            <>
              <h1 className="scripture hero-scripture">&ldquo;{verse.text}&rdquo;</h1>
              <p className="hero-ref">{verse.ref}</p>
              {verse.thought && <p className="hero-reflection t-soft">{verse.thought}</p>}
            </>
          ) : (
            <>
              <h1 className="scripture hero-scripture">Um sinal de fé, todo dia.</h1>
              <p className="hero-reflection t-soft">
                Salmos, orações e versículos chegando, uma palavra por dia. Volte amanhã pra uma nova.
              </p>
            </>
          )}

          <div className="hero-cta">
            <Link className="btn btn-primary" href={verse ? '/versiculo-do-dia' : '/biblia'}>
              {verse ? 'Ver o versículo de hoje' : 'Explorar a Bíblia por tema'}
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
              <BrandMark size={22} className="dcard-star" />
              {verse ? (
                <>
                  <p className="dcard-theme">{verse.ref}</p>
                  <p className="dcard-verse">&ldquo;{shortVerse}&rdquo;</p>
                </>
              ) : (
                <p className="dcard-verse">um sinal de fé todo dia</p>
              )}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
