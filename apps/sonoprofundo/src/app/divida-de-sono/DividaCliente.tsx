'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/* ─── Types & constants ───────────────────────────────────────────────────── */

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const DAY_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const TARGETS = [
  { label: '6h (mínimo)', value: 6 },
  { label: '7h', value: 7 },
  { label: '7,5h (recomendado)', value: 7.5 },
  { label: '8h (ideal)', value: 8 },
  { label: '9h', value: 9 },
];

const DEFAULT_HOURS = [7, 6.5, 7, 6, 7.5, 8, 7.5];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function fmtH(h: number): string {
  const whole = Math.floor(h);
  const half = h % 1 !== 0;
  return half ? `${whole}h30` : `${whole}h`;
}

function debtColor(debt: number): string {
  if (debt <= 0) return 'var(--color-cool-sage)';
  if (debt <= 2) return 'var(--color-amber-glow)';
  return 'var(--color-cool-rose)';
}

function barColor(slept: number, target: number): string {
  const deficit = target - slept;
  if (deficit <= 0) return 'var(--color-cool-sage)';
  if (deficit <= 1) return 'var(--color-amber-glow)';
  return 'var(--color-cool-rose)';
}

/* ─── Share dialog ────────────────────────────────────────────────────────── */

function ShareDialog({
  totalDebt,
  avgSlept,
  target,
  onClose,
}: {
  totalDebt: number;
  avgSlept: number;
  target: number;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    setCanNative(typeof navigator !== 'undefined' && 'share' in navigator);
    setPageUrl(`${window.location.origin}/divida-de-sono`);
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

  const debtLabel = totalDebt <= 0 ? 'nenhuma dívida' : `${fmtH(totalDebt)} de dívida`;
  const longText = totalDebt <= 0
    ? `Esta semana dormi uma média de ${fmtH(avgSlept)} por noite — sem dívida de sono acumulada!\n\nCalcule a sua dívida: ${pageUrl}`
    : `Acumulei ${debtLabel} de sono esta semana, dormindo uma média de ${fmtH(avgSlept)}/noite com meta de ${fmtH(target)}.\n\nCalcule a sua: ${pageUrl}`;

  const shortText = totalDebt <= 0
    ? `Dormi bem esta semana — ${fmtH(avgSlept)}/noite e sem dívida de sono. Calcule a sua:`
    : `Acumulei ${fmtH(totalDebt)} de dívida de sono esta semana. Calcule a sua:`;

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
      await navigator.share({ title: 'Calculadora de Dívida de Sono', text: shortText, url: pageUrl });
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
      aria-labelledby="share-divida-title"
    >
      <div
        className="w-full max-w-md bg-[var(--color-ink-night)] border border-[var(--color-border)] rounded-t-2xl sm:rounded-2xl p-6 sm:p-7 max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="kicker mb-1" id="share-divida-title">Compartilhar resultado</p>
            <p className="text-xs text-[var(--color-text-faint)]">Desafie seus amigos a calcularem</p>
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

/* ─── Day input row ───────────────────────────────────────────────────────── */

function DayRow({
  label,
  value,
  target,
  onChange,
}: {
  label: string;
  value: number;
  target: number;
  onChange: (v: number) => void;
}) {
  const deficit = target - value;
  const color = barColor(value, target);
  const pct = Math.min(100, (value / 12) * 100);

  return (
    <div className="py-3 border-b border-[var(--color-border)] last:border-0">
      <div className="flex items-center gap-3">
        <span className="serif text-sm text-[var(--color-muted)] w-10 flex-shrink-0">{label}</span>

        {/* stepper */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => onChange(Math.max(0, Math.round((value - 0.5) * 10) / 10))}
            className="w-7 h-7 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-moon)] flex items-center justify-center text-base hover:border-[var(--color-amber-glow)]/50 transition-colors"
            aria-label={`Diminuir horas de ${label}`}
          >
            −
          </button>
          <span className="font-mono text-sm text-[var(--color-text-moon)] w-10 text-center">
            {fmtH(value)}
          </span>
          <button
            type="button"
            onClick={() => onChange(Math.min(12, Math.round((value + 0.5) * 10) / 10))}
            className="w-7 h-7 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-moon)] flex items-center justify-center text-base hover:border-[var(--color-amber-glow)]/50 transition-colors"
            aria-label={`Aumentar horas de ${label}`}
          >
            +
          </button>
        </div>

        {/* bar */}
        <div className="flex-1 h-2 rounded-full bg-[var(--color-ink-fog)] overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-200"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>

        {/* deficit label */}
        <span className="font-mono text-xs w-12 text-right flex-shrink-0" style={{ color }}>
          {deficit > 0 ? `−${fmtH(deficit)}` : deficit === 0 ? '✓' : `+${fmtH(Math.abs(deficit))}`}
        </span>
      </div>
    </div>
  );
}

/* ─── Other tools ─────────────────────────────────────────────────────────── */

const OTHER_TOOLS = [
  { href: '/teste', label: 'Teste de Qualidade do Sono' },
  { href: '/ciclos', label: 'Calculadora de Ciclos de Sono' },
  { href: '/cronotipo', label: 'Calculadora de Cronotipo' },
  { href: '/apneia', label: 'Triagem de Apneia (STOP-BANG)' },
];

/* ─── Main component ──────────────────────────────────────────────────────── */

export default function DividaCliente() {
  const [hours, setHours] = useState<number[]>([...DEFAULT_HOURS]);
  const [target, setTarget] = useState<number>(8);
  const [showShare, setShowShare] = useState(false);

  function setDay(i: number, v: number) {
    setHours((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
  }

  const totalSlept = hours.reduce((a, b) => a + b, 0);
  const avgSlept = Math.round((totalSlept / 7) * 10) / 10;
  const weekTarget = target * 7;
  const totalDebt = Math.round((weekTarget - totalSlept) * 10) / 10;
  const recoveryNights = totalDebt > 0 ? Math.ceil(totalDebt / 1) : 0; // 1h extra/night
  const debtColorMain = debtColor(totalDebt);

  const debts = hours.map((h) => Math.round((target - h) * 10) / 10);
  const maxBarH = 120; // px for chart

  return (
    <div className="container mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="kicker mb-4">Ferramenta gratuita</p>
        <h1 className="serif text-4xl sm:text-5xl font-normal leading-tight tracking-tight mb-4">
          Calculadora de Dívida de Sono
        </h1>
        <p className="serif text-base text-[var(--color-muted)] leading-relaxed max-w-lg mx-auto">
          Cada noite dormindo menos do que o necessário acumula dívida. Informe quantas horas
          dormiu em cada dia desta semana e veja o impacto acumulado.
        </p>
      </div>

      {/* Target selector */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 mb-6">
        <p className="serif text-sm text-[var(--color-muted)] mb-3">Meta de sono por noite</p>
        <div className="flex flex-wrap gap-2">
          {TARGETS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTarget(t.value)}
              className={`rounded-lg border px-3 py-1.5 serif text-xs transition-colors ${
                target === t.value
                  ? 'border-[var(--color-amber-glow)] bg-[var(--color-amber-ember)] text-[var(--color-text-moon)]'
                  : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-amber-glow)]/40'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Day inputs */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="kicker">Horas dormidas por dia</p>
          <p className="text-xs text-[var(--color-text-faint)]">meta: {fmtH(target)}/noite</p>
        </div>
        {DAYS.map((day, i) => (
          <DayRow
            key={day}
            label={DAY_SHORT[i]!}
            value={hours[i] ?? 7}
            target={target}
            onChange={(v) => setDay(i, v)}
          />
        ))}
      </div>

      {/* Bar chart */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 mb-6">
        <p className="kicker mb-5">Visualização da semana</p>
        <div className="flex items-end gap-1.5 h-32">
          {/* Target line guide */}
          {hours.map((h, i) => {
            const pct = Math.min(100, (h / (target * 1.5)) * 100);
            const targetPct = Math.min(100, (target / (target * 1.5)) * 100);
            const color = barColor(h, target);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="relative w-full rounded-t"
                  style={{ height: `${maxBarH}px` }}
                >
                  {/* target line */}
                  <div
                    className="absolute left-0 right-0 border-t border-dashed border-[var(--color-border)]"
                    style={{ bottom: `${targetPct}%` }}
                  />
                  {/* bar */}
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-t transition-all duration-200"
                    style={{ height: `${pct}%`, backgroundColor: color, opacity: 0.85 }}
                  />
                </div>
                <span className="text-[10px] font-mono text-[var(--color-text-faint)]">
                  {DAY_SHORT[i]}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-[var(--color-text-faint)] mt-2">
          Linha tracejada = meta. Verde: dentro da meta · Âmbar: até 1h abaixo · Vermelho: mais de 1h abaixo
        </p>
      </div>

      {/* Summary */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 sm:p-8 mb-6">
        <p className="kicker mb-5">Resumo da semana</p>
        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-ink-night)] p-4">
            <p className="text-xs text-[var(--color-text-faint)] mb-1">Média por noite</p>
            <p className="serif text-2xl font-normal" style={{ color: debtColorMain }}>
              {fmtH(avgSlept)}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-ink-night)] p-4">
            <p className="text-xs text-[var(--color-text-faint)] mb-1">Dívida total</p>
            <p className="serif text-2xl font-normal" style={{ color: debtColorMain }}>
              {totalDebt > 0 ? `−${fmtH(totalDebt)}` : totalDebt < 0 ? `+${fmtH(Math.abs(totalDebt))}` : '0h'}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-ink-night)] p-4">
            <p className="text-xs text-[var(--color-text-faint)] mb-1">Para recuperar</p>
            <p className="serif text-2xl font-normal" style={{ color: debtColorMain }}>
              {totalDebt <= 0 ? '—' : `~${recoveryNights} noite${recoveryNights !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {/* Per-day debt */}
        <div>
          <p className="text-xs text-[var(--color-text-faint)] mb-3">Dívida acumulada por dia</p>
          <div className="flex gap-1.5">
            {debts.map((d, i) => {
              let cumulative = 0;
              for (let j = 0; j <= i; j++) cumulative += debts[j] ?? 0;
              const cColor = debtColor(cumulative);
              return (
                <div key={i} className="flex-1 text-center">
                  <div
                    className="text-[10px] font-mono mb-0.5"
                    style={{ color: cColor }}
                  >
                    {cumulative > 0 ? `−${fmtH(Math.round(cumulative * 10) / 10)}` : '✓'}
                  </div>
                  <div className="text-[9px] text-[var(--color-text-faint)]">{DAY_SHORT[i]}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tips */}
      {totalDebt > 0 && (
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 mb-6">
          <p className="kicker mb-4">Como recuperar</p>
          <div className="space-y-3">
            {[
              {
                title: 'Adicione 1h por noite, não tudo de uma vez',
                body: 'Tentar recuperar toda a dívida em um fim de semana desregula o ritmo circadiano. Adicione 45 min a 1h por noite durante os próximos dias.',
              },
              {
                title: 'Priorize o horário de acordar fixo',
                body: 'Acordar sempre no mesmo horário — mesmo com sono — é o fator mais importante para regular o ritmo. Durma mais cedo, não mais tarde.',
              },
              {
                title: 'Cochilo estratégico de 20 minutos',
                body: 'Um cochilo de 20 min entre 13h e 15h reduz a sonolência sem comprometer o sono noturno. Mais do que isso pode criar inércia do sono.',
              },
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
      )}

      {/* Share */}
      <section
        className="rounded-2xl border border-[var(--color-amber-glow)]/30 p-6 mb-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--color-amber-ember) 0%, transparent 70%)' }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex-1">
            <p className="kicker mb-2">Compartilhar</p>
            <p className="serif text-base text-[var(--color-text-moon)] leading-snug">
              {totalDebt > 0
                ? `Você acumulou ${fmtH(totalDebt)} de dívida.`
                : 'Seu sono está em dia esta semana!'}
            </p>
            <p className="text-sm text-[var(--color-muted)] mt-1 leading-relaxed">Desafie seus amigos a calcularem a dívida deles.</p>
          </div>
          <button onClick={() => setShowShare(true)} className="btn-primary text-sm whitespace-nowrap w-full sm:w-auto">
            Compartilhar →
          </button>
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
              <span className="text-[var(--color-amber-glow)] text-sm flex-shrink-0">→</span>
            </Link>
          ))}
        </div>
      </section>

      {showShare && (
        <ShareDialog
          totalDebt={totalDebt}
          avgSlept={avgSlept}
          target={target}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
