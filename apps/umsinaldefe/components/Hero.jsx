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
          {/* Lâmina de rosto, no mesmo desenho da imagem de compartilhamento:
              fios, marca e a referência em destaque. Não repete o texto do
              versículo, que já é o H1 ao lado. */}
          <figure className="plate">
            <hr className="plate-rule" />
            <figcaption className="plate-in">
              <span className="plate-kicker">Versículo do dia</span>
              <p className="plate-ref">{verse ? verse.ref : 'Um Sinal de Fé'}</p>
              <BrandMark size={20} className="plate-mark" />
              <p className="plate-date">{dateStr}</p>
            </figcaption>
            <hr className="plate-rule" />
          </figure>
        </div>
      </div>
    </section>
  );
}
