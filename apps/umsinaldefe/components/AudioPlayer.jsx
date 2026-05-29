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

export function AudioPlayer({ title, subtitle, duration = 180, variant = 'feature', bars = 48 }) {
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const heights = useMemo(() => waveHeights(bars, title.length + duration), [bars, title, duration]);
  const ref = useRef(null);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setT((p) => {
        if (p >= duration) { setPlaying(false); return duration; }
        return p + 0.1;
      });
    }, 100);
    return () => clearInterval(id);
  }, [playing, duration]);

  const pct = Math.min(1, t / duration);
  const seek = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const x = (clientX - rect.left) / rect.width;
    setT(Math.max(0, Math.min(1, x)) * duration);
  };

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
        onClick={() => setPlaying((p) => !p)}
        aria-label={(playing ? 'Pausar ' : 'Ouvir ') + title}
      >
        <span className="ap-row-btn">
          <Glyph name={playing ? 'pause' : 'play'} size={18} />
        </span>
        <span className="ap-row-meta">
          <span className="ap-row-title">{title}</span>
          <span className="ap-row-time">
            {(playing || t > 0) ? `${fmt(t)} / ` : ''}{fmt(duration)}
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
      <button className="ap-play" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pausar' : 'Ouvir'}>
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
          <span>−{fmt(duration - t)}</span>
        </div>
      </div>
    </div>
  );
}

export { fmt as fmtTime };
