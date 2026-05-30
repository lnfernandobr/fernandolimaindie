'use client';
import { useRouter } from 'next/navigation';
import { Glyph } from './Glyph.jsx';
import { AudioPlayer } from './AudioPlayer.jsx';
import { PRAYERS } from '@/lib/design-data.js';

export function PrayersList({ audioEnabled = false }) {
  const router = useRouter();
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
          {PRAYERS.map((pr) => (
            <article
              key={pr.slug}
              className="prayer-row reveal"
              onClick={() => router.push(`/oracao/${pr.slug}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="prayer-main">
                <span className="prayer-tag">{pr.tag}</span>
                <h3 className="prayer-title">{pr.title}</h3>
                <p className="prayer-line scripture">&ldquo;{pr.line}&rdquo;</p>
              </div>
              {audioEnabled && (
                <div className="prayer-player" onClick={(e) => e.stopPropagation()}>
                  <AudioPlayer
                    title={pr.title.replace('Oração ', '')}
                    duration={pr.audio}
                    src={`/api/tts/oracao-${pr.slug}`}
                    variant="row"
                  />
                </div>
              )}
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
