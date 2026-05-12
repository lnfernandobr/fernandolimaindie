'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function fmt2(n: number) {
  return String(n).padStart(2, '0');
}

function minsToTime(mins: number): string {
  const t = ((mins % 1440) + 1440) % 1440;
  return `${fmt2(Math.floor(t / 60))}:${fmt2(t % 60)}`;
}

const CYCLE = 90; // minutes per cycle
const FALL = 15;  // average time to fall asleep

interface CycleResult {
  cycles: number;
  time: string;
  totalH: number;
  recommended: boolean;
}

function calcBedtimes(wakeH: number, wakeM: number): CycleResult[] {
  const wake = wakeH * 60 + wakeM;
  return [6, 5, 4, 3].map((n) => ({
    cycles: n,
    time: minsToTime(wake - FALL - n * CYCLE),
    totalH: n * 1.5,
    recommended: n >= 5,
  }));
}

function calcWakeTimes(bedH: number, bedM: number): CycleResult[] {
  const bed = bedH * 60 + bedM;
  return [3, 4, 5, 6].map((n) => ({
    cycles: n,
    time: minsToTime(bed + FALL + n * CYCLE),
    totalH: n * 1.5,
    recommended: n >= 5,
  }));
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINS = [0, 15, 30, 45];

/* ─── Cycle colors — shifts from deep-sleep-dominant to REM-dominant ─────── */
const CYCLE_COLORS = [
  'var(--color-cool-plum)',   // cycle 1 — heavy SWS
  'var(--color-cool-deep)',   // cycle 2
  'var(--color-cool-deep)',   // cycle 3
  'var(--color-cool-sage)',   // cycle 4
  'var(--color-cool-sage)',   // cycle 5
  'var(--color-cool-rose)',   // cycle 6 — heavy REM
];

/* ─── Share dialog ────────────────────────────────────────────────────────── */

function ShareDialog({
  mode,
  refTime,
  best,
  onClose,
}: {
  mode: 'wake' | 'bed';
  refTime: string;
  best: CycleResult;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    setCanNative(typeof navigator !== 'undefined' && 'share' in navigator);
    setPageUrl(`${window.location.origin}/ciclos`);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const actionLabel =
    mode === 'wake'
      ? `Para acordar às ${refTime}`
      : `Dormindo às ${refTime}`;
  const resultLabel =
    mode === 'wake'
      ? `o ideal é dormir às ${best.time}`
      : `o ideal é acordar às ${best.time}`;

  const longText = `${actionLabel}, ${resultLabel} — completando ${best.cycles} ciclos de sono (${best.totalH}h).

Calcule o seu horário ideal: ${pageUrl}`;

  const shortText = `${actionLabel}, ${resultLabel} — ${best.cycles} ciclos (${best.totalH}h). Calcule o seu:`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(longText);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = longText;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  }

  async function handleNative() {
    try {
      await navigator.share({ title: 'Calculadora de Ciclos de Sono', text: shortText, url: pageUrl });
    } catch { /* cancelled */ }
  }

  const wa = `https://wa.me/?text=${encodeURIComponent(`${shortText} ${pageUrl}`)}`;
  const tw = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shortText)}&url=${encodeURIComponent(pageUrl)}`;
  const tg = `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shortText)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-ciclos-title"
    >
      <div
        className="w-full max-w-md bg-[var(--color-ink-night)] border border-[var(--color-border)] rounded-t-2xl sm:rounded-2xl p-6 sm:p-7 max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="kicker mb-1" id="share-ciclos-title">Compartilhar resultado</p>
            <p className="text-xs text-[var(--color-text-faint)]">Escolha como prefere enviar</p>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-faint)] hover:text-[var(--color-text-moon)] text-2xl leading-none -mt-2 -mr-1 p-2" aria-label="Fechar">×</button>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 mb-5">
          <p className="text-[10px] text-[var(--color-text-faint)] mb-2 uppercase tracking-widest font-mono font-semibold">Prévia</p>
          <p className="serif text-sm text-[var(--color-muted)] leading-relaxed whitespace-pre-wrap">{longText}</p>
        </div>

        <div className="space-y-2">
          {canNative && (
            <button onClick={handleNative} className="btn-primary text-sm w-full justify-center">Compartilhar agora</button>
          )}
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm w-full justify-center" onClick={onClose}>WhatsApp</a>
          <a href={tg} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm w-full justify-center" onClick={onClose}>Telegram</a>
          <a href={tw} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm w-full justify-center" onClick={onClose}>X (Twitter)</a>
          <button
            onClick={handleCopy}
            className={`btn-ghost text-sm w-full justify-center ${copied ? 'border-[var(--color-cool-sage)] text-[var(--color-cool-sage)]' : ''}`}
          >
            {copied ? 'Copiado!' : 'Copiar texto'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Time select ─────────────────────────────────────────────────────────── */

function TimeSelect({
  hour,
  minute,
  onHour,
  onMinute,
  label,
}: {
  hour: number;
  minute: number;
  onHour: (h: number) => void;
  onMinute: (m: number) => void;
  label: string;
}) {
  const selectCls =
    'rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3.5 serif text-2xl text-[var(--color-text-moon)] focus:outline-none focus:border-[var(--color-amber-glow)] cursor-pointer appearance-none text-center';

  return (
    <div>
      <p className="text-xs text-[var(--color-text-faint)] text-center mb-3">{label}</p>
      <div className="flex items-center gap-2 justify-center">
        <select
          className={selectCls}
          value={hour}
          onChange={(e) => onHour(Number(e.target.value))}
          aria-label="Hora"
        >
          {HOURS.map((h) => (
            <option key={h} value={h}>{fmt2(h)}</option>
          ))}
        </select>
        <span className="serif text-2xl text-[var(--color-text-faint)]">:</span>
        <select
          className={selectCls}
          value={minute}
          onChange={(e) => onMinute(Number(e.target.value))}
          aria-label="Minutos"
        >
          {MINS.map((m) => (
            <option key={m} value={m}>{fmt2(m)}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* ─── Cycle strip visual ──────────────────────────────────────────────────── */

function CycleStrip({ count }: { count: number }) {
  return (
    <div className="mt-4">
      <p className="text-xs text-[var(--color-text-faint)] mb-2">Ciclos de sono (cada bloco = 90 min)</p>
      <div className="flex gap-1 h-6 rounded-lg overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded"
            style={{ backgroundColor: CYCLE_COLORS[i] ?? 'var(--color-cool-rose)', opacity: 0.85 }}
          />
        ))}
        {Array.from({ length: Math.max(0, 6 - count) }).map((_, i) => (
          <div key={`empty-${i}`} className="flex-1 rounded bg-[var(--color-ink-fog)]" />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-[var(--color-text-faint)] mt-1.5 font-mono">
        <span>Sono profundo</span>
        <span>REM</span>
      </div>
    </div>
  );
}

/* ─── Result card ─────────────────────────────────────────────────────────── */

function ResultCard({
  result,
  mode,
  selected,
  onSelect,
}: {
  result: CycleResult;
  mode: 'wake' | 'bed';
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border p-5 transition-all ${
        selected
          ? 'border-[var(--color-amber-glow)] bg-[var(--color-amber-ember)]'
          : 'border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-amber-glow)]/50'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="serif text-3xl font-normal text-[var(--color-text-moon)] leading-none tracking-tight">
            {result.time}
          </p>
          <p className="text-xs text-[var(--color-text-faint)] mt-1">
            {mode === 'wake' ? 'horário de dormir' : 'horário de acordar'}
          </p>
        </div>
        <div className="text-right">
          {result.recommended && (
            <span className="inline-block rounded-full bg-[var(--color-cool-sage)]/20 text-[var(--color-cool-sage)] text-[10px] font-mono px-2 py-0.5 mb-1">
              recomendado
            </span>
          )}
          <p className="text-xs text-[var(--color-text-faint)]">{result.totalH}h · {result.cycles} ciclos</p>
        </div>
      </div>
      <CycleStrip count={result.cycles} />
    </button>
  );
}

/* ─── Other tools ─────────────────────────────────────────────────────────── */

const OTHER_TOOLS = [
  { href: '/teste', label: 'Teste de Qualidade do Sono' },
  { href: '/cronotipo', label: 'Calculadora de Cronotipo' },
  { href: '/divida-de-sono', label: 'Calculadora de Dívida de Sono' },
  { href: '/apneia', label: 'Triagem de Apneia (STOP-BANG)' },
];

/* ─── Main component ──────────────────────────────────────────────────────── */

export default function CiclosCliente() {
  const [mode, setMode] = useState<'wake' | 'bed'>('wake');
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showShare, setShowShare] = useState(false);

  const results = mode === 'wake' ? calcBedtimes(hour, minute) : calcWakeTimes(hour, minute);
  const refTime = `${fmt2(hour)}:${fmt2(minute)}`;
  const selectedResult = results[selectedIdx] ?? results[0]!;

  // Auto-select the first recommended result when mode or time changes
  useEffect(() => {
    const firstRecommended = results.findIndex((r) => r.recommended);
    setSelectedIdx(firstRecommended >= 0 ? firstRecommended : 0);
  }, [mode, hour, minute]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="container mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="kicker mb-4">Ferramenta gratuita</p>
        <h1 className="serif text-4xl sm:text-5xl font-normal leading-tight tracking-tight mb-4">
          Calculadora de Ciclos de Sono
        </h1>
        <p className="serif text-base text-[var(--color-muted)] leading-relaxed max-w-lg mx-auto">
          O sono ocorre em ciclos de 90 minutos. Acordar no meio de um ciclo deixa você
          sonolento — mesmo que tenha dormido horas suficientes. Calcule o horário exato
          para acordar no momento certo.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-8 p-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]">
        {(['wake', 'bed'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 rounded-xl py-2.5 serif text-sm transition-all ${
              mode === m
                ? 'bg-[var(--color-amber-glow)] text-[var(--color-ink-night)] font-semibold'
                : 'text-[var(--color-muted)] hover:text-[var(--color-text-moon)]'
            }`}
          >
            {m === 'wake' ? 'Quero acordar às…' : 'Vou dormir às…'}
          </button>
        ))}
      </div>

      {/* Time picker */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 sm:p-8 mb-8">
        <TimeSelect
          hour={hour}
          minute={minute}
          onHour={setHour}
          onMinute={setMinute}
          label={
            mode === 'wake'
              ? 'Selecione o horário que você quer acordar'
              : 'Selecione o horário que você vai para a cama'
          }
        />
      </div>

      {/* Results */}
      <div className="mb-6">
        <p className="kicker mb-4">
          {mode === 'wake' ? 'Horários ideais para dormir' : 'Horários ideais para acordar'}
        </p>
        <div className="space-y-3">
          {results.map((r, i) => (
            <ResultCard
              key={r.cycles}
              result={r}
              mode={mode}
              selected={selectedIdx === i}
              onSelect={() => setSelectedIdx(i)}
            />
          ))}
        </div>
      </div>

      {/* Share */}
      <section
        className="rounded-2xl border border-[var(--color-amber-glow)]/30 p-6 mb-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--color-amber-ember) 0%, transparent 70%)' }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex-1">
            <p className="kicker mb-2">Compartilhar</p>
            <p className="serif text-base text-[var(--color-text-moon)] leading-snug">
              Envie o resultado para um amigo.
            </p>
            <p className="text-sm text-[var(--color-muted)] mt-1 leading-relaxed">
              Resultado selecionado: {selectedResult.time} · {selectedResult.cycles} ciclos ({selectedResult.totalH}h)
            </p>
          </div>
          <button
            onClick={() => setShowShare(true)}
            className="btn-primary text-sm whitespace-nowrap w-full sm:w-auto"
          >
            Compartilhar →
          </button>
        </div>
      </section>

      {/* Info card */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 mb-8">
        <p className="kicker mb-4">Como funciona</p>
        <div className="space-y-3">
          {[
            { title: 'Ciclo de 90 minutos', body: 'Cada ciclo de sono percorre estágios N1, N2, N3 (sono profundo) e REM. Interromper o ciclo no meio causa a inércia do sono — aquela sensação de atordoamento ao acordar.' },
            { title: '+15 minutos para adormecer', body: 'A calculadora considera o tempo médio para adormecer após deitar. Se você costuma levar mais tempo, tente dormir 15–30 min mais cedo.' },
            { title: '5 a 6 ciclos = ideal para adultos', body: '5 ciclos = 7h30 e 6 ciclos = 9h. A maioria dos adultos funciona melhor com 5 ciclos. Abaixo de 4 (6h), a privação de sono acumula rapidamente.' },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-amber-glow)] mt-2 flex-shrink-0" aria-hidden />
              <div>
                <p className="serif text-sm font-semibold text-[var(--color-text-moon)]">{item.title}</p>
                <p className="serif text-sm text-[var(--color-muted)] mt-0.5 leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Other tools */}
      <section className="border-t border-[var(--color-border)] pt-8">
        <p className="kicker mb-4">Outras ferramentas</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {OTHER_TOOLS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 hover:border-[var(--color-amber-glow)]/40 transition-colors group"
            >
              <span className="serif text-sm text-[var(--color-muted)] group-hover:text-[var(--color-text-moon)] transition-colors">{t.label}</span>
              <span className="text-[var(--color-amber-glow)] text-sm flex-shrink-0 group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          ))}
        </div>
      </section>

      {showShare && (
        <ShareDialog
          mode={mode}
          refTime={refTime}
          best={selectedResult}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
