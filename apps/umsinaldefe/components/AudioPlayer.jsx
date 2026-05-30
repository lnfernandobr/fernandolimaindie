'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Glyph } from './Glyph.jsx';

const fmt = (s) => {
  s = Math.max(0, Math.round(s));
  const m = Math.floor(s / 60), r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
};

const waveHeights = (n, seed = 7) => {
  const out = [];
  let x = seed;
  for (let i = 0; i < n; i++) {
    x = (x * 9301 + 49297) % 233280;
    const r = x / 233280;
    const env = Math.sin((i / n) * Math.PI);
    out.push(0.28 + (0.35 + r * 0.5) * (0.5 + env * 0.6));
  }
  return out;
};

/**
 * Player de áudio. Quando recebe `src` (ex.: /api/tts/<slug>), toca o áudio
 * real da ElevenLabs e dirige a onda pela tag <audio>. Sem `src`, ou se o
 * áudio real falhar (ex.: chave ausente em dev), cai no modo simulado, com a
 * onda animada e o tempo correndo, pra nunca ficar com cara de quebrado.
 */
export function AudioPlayer({ title, subtitle, src, duration = 180, variant = 'feature', bars = 48 }) {
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [realDur, setRealDur] = useState(null);
  const [failed, setFailed] = useState(false);
  const heights = useMemo(() => waveHeights(bars, title.length + duration), [bars, title, duration]);
  const ref = useRef(null);
  const audioRef = useRef(null);

  const useReal = Boolean(src) && !failed;
  const effDur = realDur ?? duration;

  // Modo simulado: só roda quando não há áudio real tocando.
  useEffect(() => {
    if (!playing || useReal) return;
    const id = setInterval(() => {
      setT((p) => {
        if (p >= effDur) { setPlaying(false); return effDur; }
        return p + 0.1;
      });
    }, 100);
    return () => clearInterval(id);
  }, [playing, useReal, effDur]);

  const pct = Math.min(1, t / effDur);

  const toggle = async () => {
    if (useReal) {
      const a = audioRef.current;
      if (!a) return;
      if (a.paused) {
        try {
          await a.play();
          setPlaying(true);
        } catch {
          // Áudio real indisponível: assume simulado a partir daqui.
          setFailed(true);
          setPlaying(true);
        }
      } else {
        a.pause();
        setPlaying(false);
      }
    } else {
      setPlaying((p) => !p);
    }
  };

  const seek = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const nt = x * effDur;
    setT(nt);
    if (useReal && audioRef.current) audioRef.current.currentTime = nt;
  };

  const audioEl = src ? (
    <audio
      ref={audioRef}
      src={src}
      preload="none"
      onLoadedMetadata={(e) => {
        const d = e.currentTarget.duration;
        if (Number.isFinite(d) && d > 0) setRealDur(d);
      }}
      onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
      onEnded={() => setPlaying(false)}
      onError={() => { setFailed(true); }}
    />
  ) : null;

  const pine = variant === 'pine';
  const accent    = pine ? 'var(--gold-soft)' : 'var(--gold)';
  const txt       = pine ? 'var(--on-pine)'   : 'var(--ink)';
  const sub       = pine ? 'var(--on-pine-soft)' : 'var(--ink-faint)';
  const trackBg   = pine ? 'rgba(239,231,214,.18)' : 'var(--line-strong)';
  const playedTo  = Math.round(pct * bars);

  if (variant === 'row') {
    return (
      <button
        className="ap-row"
        onClick={toggle}
        aria-label={(playing ? 'Pausar ' : 'Ouvir ') + title}
      >
        {audioEl}
        <span className="ap-row-btn">
          <Glyph name={playing ? 'pause' : 'play'} size={18} />
        </span>
        <span className="ap-row-meta">
          <span className="ap-row-title">{title}</span>
          <span className="ap-row-time">
            {(playing || t > 0) ? `${fmt(t)} / ` : ''}{fmt(effDur)}
          </span>
        </span>
        <span className="ap-row-wave" aria-hidden="true">
          {heights.slice(0, 14).map((h, i) => (
            <i
              key={i}
              style={{ height: `${h * 100}%`, background: i < Math.round(pct * 14) ? accent : trackBg, animationDelay: `${i * 0.07}s` }}
              className={playing ? 'live' : ''}
            />
          ))}
        </span>
      </button>
    );
  }

  return (
    <div className={`ap ${pine ? 'ap-pine' : 'ap-feature'}`}>
      {audioEl}
      <button className="ap-play" onClick={toggle} aria-label={playing ? 'Pausar' : 'Ouvir'}>
        <Glyph name={playing ? 'pause' : 'play'} size={26} />
        <span className="ap-play-ring" />
      </button>

      <div className="ap-body">
        <div className="ap-head">
          <span className="ap-label" style={{ color: sub }}>
            <Glyph name="headphones" size={14} /> Ouvir agora
          </span>
          <span className="ap-title" style={{ color: txt }}>
            {title}{subtitle && <em style={{ color: sub }}> · {subtitle}</em>}
          </span>
        </div>

        <div
          className="ap-wave"
          ref={ref}
          onClick={seek}
          role="slider"
          aria-label="Progresso"
          aria-valuenow={Math.round(pct * 100)}
          tabIndex={0}
        >
          {heights.map((h, i) => (
            <i
              key={i}
              className={playing ? 'live' : ''}
              style={{
                height: `${h * 100}%`,
                background: i <= playedTo ? accent : trackBg,
                animationDelay: `${i * 0.045}s`,
              }}
            />
          ))}
        </div>

        <div className="ap-time" style={{ color: sub }}>
          <span>{fmt(t)}</span>
          <span>−{fmt(effDur - t)}</span>
        </div>
      </div>
    </div>
  );
}

export { fmt as fmtTime };
