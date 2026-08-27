'use client';
import { useRouter } from 'next/navigation';
import { Glyph } from './Glyph.jsx';
import { signalUrl } from '@/lib/content/signal-url.js';
import { INTENT_LABELS } from '@/lib/content/intents.js';

/**
 * Orações em destaque na home. Recebe signals (kind=prayer) da API — só linka o
 * que existe. Se não houver nenhum, a home esconde a seção (ver app/page.jsx).
 */
export function PrayersList({ prayers = [] }) {
  const router = useRouter();
  if (!prayers.length) return null;

  return (
    <section className="section prayers pine" id="oracoes">
      <div className="wrap">
        <div className="sec-head reveal">
          <div>
            <p className="eyebrow on-pine"><span className="star">✦</span> Orações</p>
            <h2 className="display sec-title on-pine">Pra ter na ponta da língua</h2>
          </div>
          <p className="sec-lead on-pine-soft">
            Orações curtas pra rezar de cor, antes de dormir, ao acordar, ou quando a causa
            parece impossível.
          </p>
        </div>

        <div className="prayer-list">
          {prayers.map((pr) => (
            <article
              key={pr.slug}
              className="prayer-row reveal"
              onClick={() => router.push(signalUrl(pr))}
              style={{ cursor: 'pointer' }}
            >
              <div className="prayer-main">
                <span className="prayer-tag">{INTENT_LABELS[pr.intent] ?? 'Oração'}</span>
                <h3 className="prayer-title">{pr.title}</h3>
                <p className="prayer-line scripture">&ldquo;{pr.answer}&rdquo;</p>
              </div>
            </article>
          ))}
        </div>

        <div className="sec-more reveal">
          <button
            className="btn btn-gold"
            onClick={() => router.push('/oracao')}
          >
            Ver todas as orações <Glyph name="arrow" size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
