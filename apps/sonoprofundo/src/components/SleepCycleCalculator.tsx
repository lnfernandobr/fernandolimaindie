'use client';
import { useMemo, useState } from 'react';

const CYCLE_MIN = 90;
const LATENCY_MIN = 14;

type Mode = 'sleepNow' | 'wakeAt';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface Option {
  time: string;
  cycles: number;
  hours: number;
}

function compute(mode: Mode, wakeAt: string, anchor: Date): Option[] {
  if (mode === 'sleepNow') {
    const start = new Date(anchor.getTime() + LATENCY_MIN * 60_000);
    return [6, 5, 4, 3].map((n) => {
      const t = new Date(start.getTime() + n * CYCLE_MIN * 60_000);
      return { time: formatTime(t), cycles: n, hours: (n * CYCLE_MIN) / 60 };
    });
  }

  const [hh, mm] = wakeAt.split(':').map((s) => Number(s));
  const target = new Date(anchor);
  target.setHours(hh ?? 7, mm ?? 0, 0, 0);
  if (target.getTime() <= anchor.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return [6, 5, 4, 3].map((n) => {
    const bed = new Date(target.getTime() - (n * CYCLE_MIN + LATENCY_MIN) * 60_000);
    return { time: formatTime(bed), cycles: n, hours: (n * CYCLE_MIN) / 60 };
  });
}

export default function SleepCycleCalculator() {
  const [mode, setMode] = useState<Mode>('sleepNow');
  const [wakeAt, setWakeAt] = useState('07:00');

  // Anchor sempre é o relógio do cliente; recalculado quando muda algo
  const options = useMemo(() => compute(mode, wakeAt, new Date()), [mode, wakeAt]);
  const recommended = options.find((o) => o.cycles === 5) ?? options[0]!;

  const subtitle =
    mode === 'sleepNow'
      ? 'Se você dormir agora (com ~14 min para pegar no sono), acorde em um destes horários:'
      : 'Para acordar nesse horário, vá pra cama em um destes horários:';

  return (
    <section
      aria-labelledby="tool-title"
      className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-14 sm:py-20 border-t border-[var(--color-border)]"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,_2fr)_minmax(0,_3fr)] items-start">
        <div>
          <p className="kicker mb-3">Ferramenta</p>
          <h2 id="tool-title" className="serif text-3xl sm:text-4xl font-normal tracking-tight leading-tight">
            Calculadora de ciclos de sono
          </h2>
          <p className="serif text-base sm:text-lg text-[var(--color-muted)] leading-relaxed mt-4">
            Acordar no fim de um ciclo (a cada 90 min) faz você levantar mais descansado, mesmo dormindo menos. Use os horários sugeridos pra evitar acordar no meio de um sono profundo.
          </p>
          <p className="text-xs text-[var(--color-text-faint)] mt-5 leading-relaxed">
            Estimamos 14 min para pegar no sono — média populacional saudável. Cada bloco = 1 ciclo de 90 min.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 sm:p-7">
          {/* Tabs de modo */}
          <div
            role="tablist"
            aria-label="Modo da calculadora"
            className="grid grid-cols-2 gap-2 p-1 rounded-full bg-[var(--color-ink-night)] border border-[var(--color-border)] mb-6"
          >
            <button
              role="tab"
              aria-selected={mode === 'sleepNow'}
              onClick={() => setMode('sleepNow')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                mode === 'sleepNow'
                  ? 'bg-[var(--color-amber-glow)] text-[var(--color-ink-void)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]'
              }`}
            >
              Vou dormir agora
            </button>
            <button
              role="tab"
              aria-selected={mode === 'wakeAt'}
              onClick={() => setMode('wakeAt')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                mode === 'wakeAt'
                  ? 'bg-[var(--color-amber-glow)] text-[var(--color-ink-void)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]'
              }`}
            >
              Preciso acordar às
            </button>
          </div>

          {mode === 'wakeAt' ? (
            <div className="mb-6">
              <label htmlFor="wake-time" className="block text-xs uppercase tracking-widest text-[var(--color-muted)] mb-2">
                Horário desejado de acordar
              </label>
              <input
                id="wake-time"
                type="time"
                value={wakeAt}
                onChange={(e) => setWakeAt(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[var(--color-ink-night)] border border-[var(--color-border)] text-[var(--color-fg)] text-lg font-mono tracking-wide outline-none focus:border-[var(--color-amber-glow)]/50"
              />
            </div>
          ) : null}

          <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">{subtitle}</p>

          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {options.map((o) => {
              const isRecommended = o.cycles === recommended.cycles;
              return (
                <li
                  key={o.cycles}
                  className={`relative rounded-xl border p-4 text-center transition-colors ${
                    isRecommended
                      ? 'border-[var(--color-amber-glow)]/50 bg-[var(--color-amber-ember)]'
                      : 'border-[var(--color-border)] bg-[var(--color-ink-night)]'
                  }`}
                >
                  {isRecommended ? (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-[var(--color-amber-glow)] text-[var(--color-ink-void)]">
                      ideal
                    </span>
                  ) : null}
                  <div className="serif text-2xl sm:text-3xl text-[var(--color-fg)]">{o.time}</div>
                  <div className="text-xs text-[var(--color-muted)] mt-2 leading-tight">
                    {o.cycles} ciclos
                    <br />
                    <span className="text-[var(--color-text-faint)]">{o.hours}h de sono</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
