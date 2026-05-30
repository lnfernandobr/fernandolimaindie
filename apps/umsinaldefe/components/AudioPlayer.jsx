'use client';
import { useState, useRef, useMemo } from 'react';
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
 * Player de áudio real. Toca o que vier em `src` (ex.: /api/tts/<slug>),
 * gerado pela ElevenLabs. Não simula nada: a onda e o tempo refletem o áudio
 * de verdade. Se a página não tiver áudio disponível, ela simplesmente não
 * renderiza este componente (ver `audioEnabled` nas páginas).
 */
export function AudioPlayer({ title, subtitle, src, duration = 0, variant = 'feature', bars = 48 }) {
  const [status, setStatus] = useState('idle'); // idle | loading | playing | paused | error | hidden
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(duration || 0);
  const heights = useMemo(() => waveHeights(bars, title.length + (duration || 120)), [bars, title, duration]);
  const ref = useRef(null);
  const audioRef = useRef(null);

  const playing = status === 'playing';
  const loading = status === 'loading';
  const error = status === 'error';
  const hidden = status === 'hidden';
  const effDur = dur || duration || 0;
  const pct = effDur ? Math.min(1, t / effDur) : 0;

  // Se o player está escondido (ex.: server retornou 413 = conteúdo longo),
  // simplesmente não renderiza nada.
  if (hidden) return null;

  const toggle = async () => {
    const a = audioRef.current;
    if (!a || error) return;
    if (a.paused) {
      setStatus('loading');
      try {
        await a.play();
      } catch {
        setStatus('error');
      }
    } else {
      a.pause();
    }
  };

  const seek = (e) => {
    const a = audioRef.current;
    const el = ref.current;
    if (!a || !el || !effDur) return;
    const rect = el.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    a.currentTime = x * effDur;
    setT(a.currentTime);
  };

  const audioEl = (
    <audio
      ref={audioRef}
      src={src}
      preload="none"
      onLoadedMetadata={(e) => {
        const d = e.currentTarget.duration;
        if (Number.isFinite(d) && d > 0) setDur(d);
      }}
      onPlaying={() => setStatus('playing')}
      onWaiting={() => setStatus('loading')}
      onPause={() => setStatus((s) => (s === 'playing' || s === 'loading' ? 'paused' : s))}
      onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
      onEnded={() => { setStatus('paused'); setT(0); }}
      onError={() => setStatus('hidden')}
    />
  );

  const pine = variant === 'pine';
  const accent    = pine ? 'var(--gold-soft)' : 'var(--gold)';
  const txt       = pine ? 'var(--on-pine)'   : 'var(--ink)';
  const sub       = pine ? 'var(--on-pine-soft)' : 'var(--ink-faint)';
  const trackBg   = pine ? 'rgba(239,231,214,.18)' : 'var(--line-strong)';
  const playedTo  = Math.round(pct * bars);
  const icon      = playing ? 'pause' : 'play';

  if (variant === 'row') {
    const rowTime = error
      ? 'indisponível'
      : loading
        ? 'carregando…'
        : `${(playing || t > 0) ? `${fmt(t)} / ` : ''}${effDur ? fmt(effDur) : ''}`;
    return (
      <button
        className="ap-row"
        onClick={toggle}
        disabled={error}
        aria-busy={loading}
        aria-label={(playing ? 'Pausar ' : 'Ouvir ') + title}
      >
        {audioEl}
        <span className="ap-row-btn">
          <Glyph name={icon} size={18} />
        </span>
        <span className="ap-row-meta">
          <span className="ap-row-title">{title}</span>
          <span className="ap-row-time">{rowTime}</span>
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
      <button
        className="ap-play"
        onClick={toggle}
        disabled={error}
        aria-busy={loading}
        aria-label={playing ? 'Pausar' : 'Ouvir'}
      >
        <Glyph name={icon} size={26} />
        <span className="ap-play-ring" />
      </button>

      <div className="ap-body">
        <div className="ap-head">
          <span className="ap-label" style={{ color: sub }}>
            <Glyph name="headphones" size={14} /> {error ? 'Áudio indisponível' : loading ? 'Carregando áudio…' : 'Ouvir agora'}
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
          <span>{effDur ? `−${fmt(effDur - t)}` : ''}</span>
        </div>
      </div>
    </div>
  );
}

export { fmt as fmtTime };
