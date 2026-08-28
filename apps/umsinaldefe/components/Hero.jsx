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
      <div className="wrap">
        <p className="eyebrow hero-eyebrow">
          <BrandMark size={13} className="star" /> Versículo de hoje
          <span className="hero-date">· {dateStr}</span>
        </p>
        <hr className="hero-rule" />

        {/* Duas colunas de conteúdo real: o versículo à esquerda, o comentário
            e as ações à direita. A versão anterior enchia a coluna da direita
            com um enfeite que repetia a referência e a data, e que no celular
            ainda aparecia ANTES do versículo. */}
        <div className="hero-in reveal">
          <div className="hero-quote">
            {verse ? (
              <>
                <h1 className="scripture hero-scripture">&ldquo;{verse.text}&rdquo;</h1>
                <p className="hero-ref">{verse.ref}</p>
              </>
            ) : (
              <h1 className="scripture hero-scripture">Um sinal de fé, todo dia.</h1>
            )}
          </div>

          <div className="hero-aside">
            <p className="hero-reflection t-soft">
              {verse?.thought
                ? verse.thought
                : 'Salmos, orações e versículos chegando, uma palavra por dia. Volte amanhã pra uma nova.'}
            </p>
            <div className="hero-cta">
              <Link className="btn btn-primary" href={verse ? '/versiculo-do-dia' : '/biblia'}>
                {verse ? 'Ver o versículo de hoje' : 'Explorar a Bíblia por tema'}
              </Link>
              <a className="btn btn-ghost" href="#intencoes">
                Onde está seu coração?
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
