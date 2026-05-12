'use client';

import { useState, useEffect, useLayoutEffect } from 'react';
import Link from 'next/link';

/* ─── Questions ───────────────────────────────────────────────────────────── */

interface Question {
  id: string;
  text: string;
  options: { label: string; score: number }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'wakeup_free',
    text: 'Em dias de folga (sem alarme), a que horas você geralmente acorda naturalmente?',
    options: [
      { label: 'Antes das 6h', score: 0 },
      { label: '6h – 7h', score: 1 },
      { label: '7h – 8h30', score: 2 },
      { label: '8h30 – 10h', score: 3 },
      { label: 'Após as 10h', score: 4 },
    ],
  },
  {
    id: 'sleep_free',
    text: 'Em dias de folga, a que horas você geralmente vai dormir espontaneamente?',
    options: [
      { label: 'Antes das 22h', score: 0 },
      { label: '22h – 23h', score: 1 },
      { label: '23h – 00h', score: 2 },
      { label: '00h – 01h', score: 3 },
      { label: 'Após a 01h', score: 4 },
    ],
  },
  {
    id: 'peak',
    text: 'Em qual parte do dia você se sente com mais energia, foco e produtividade?',
    options: [
      { label: 'Manhã cedo (antes das 9h)', score: 0 },
      { label: 'Manhã (9h – 12h)', score: 1 },
      { label: 'Tarde (12h – 17h)', score: 2 },
      { label: 'Fim de tarde / noite (após 17h)', score: 3 },
    ],
  },
  {
    id: 'ideal_wake',
    text: 'Se você pudesse escolher livremente, a que horas acordaria todos os dias?',
    options: [
      { label: 'Antes das 6h', score: 0 },
      { label: '6h – 7h', score: 1 },
      { label: '7h – 8h', score: 2 },
      { label: '8h – 9h', score: 3 },
      { label: 'Após as 9h', score: 4 },
    ],
  },
  {
    id: 'morning_feel',
    text: 'Como você costuma se sentir no primeiro horário após acordar?',
    options: [
      { label: 'Completamente descansado(a) e alerta imediatamente', score: 0 },
      { label: 'Bem, depois de alguns minutos', score: 1 },
      { label: 'Sonolento(a) por 30 a 60 minutos', score: 2 },
      { label: 'Muito difícil funcionar até uma hora depois', score: 3 },
    ],
  },
  {
    id: 'night_energy',
    text: 'Como você se sente às 22h – 23h em uma noite normal?',
    options: [
      { label: 'Com muito sono, mal consigo ficar acordado(a)', score: 0 },
      { label: 'Cansado(a), pronto(a) para dormir', score: 1 },
      { label: 'Razoavelmente bem, sem sono intenso', score: 2 },
      { label: 'Bem acordado(a) e com energia', score: 3 },
    ],
  },
];

const MAX_SCORE = QUESTIONS.reduce((acc, q) => acc + Math.max(...q.options.map((o) => o.score)), 0);

/* ─── Chronotype results ──────────────────────────────────────────────────── */

interface Chronotype {
  key: string;
  label: string;
  animal: string;
  animalName: string;
  tagline: string;
  description: string;
  idealSleep: string;
  idealWake: string;
  peakWindow: string;
  tips: string[];
  color: string;
}

const CHRONOTYPES: Chronotype[] = [
  {
    key: 'extreme-morning',
    label: 'Matutino Extremo',
    animal: '🐦',
    animalName: 'Cotovia',
    tagline: 'Você é uma cotovia — acorda com o sol e já está no pico.',
    description:
      'Seu relógio biológico está significativamente adiantado em relação à média. Você tem sono cedo, acorda naturalmente cedo e atinge seu pico de desempenho nas primeiras horas do dia. Isso é genético e reflete uma fase circadiana curta.',
    idealSleep: '21h – 22h',
    idealWake: '5h – 6h',
    peakWindow: '7h – 12h',
    color: 'var(--color-cool-sage)',
    tips: [
      'Aproveite as primeiras horas: agende tarefas criativas e decisões importantes antes do almoço.',
      'Resista ao impulso de compensar sono nos fins de semana — isso pode desregular seu ritmo.',
      'Em reuniões sociais noturnas, aceite que você vai cansar mais cedo — isso é fisiológico, não preguiça.',
      'Evite cafeína após o almoço para não interferir no horário natural de sono.',
    ],
  },
  {
    key: 'morning',
    label: 'Matutino',
    animal: '🐦',
    animalName: 'Cotovia',
    tagline: 'Você é uma cotovia — o dia começa cedo e vai bem.',
    description:
      'Você tem tendência matutina: prefere dormir antes da meia-noite e acorda descansado nas primeiras horas da manhã. Seu pico de energia e foco ocorre no período da manhã, com queda progressiva ao longo da tarde.',
    idealSleep: '22h – 23h',
    idealWake: '6h – 7h',
    peakWindow: '8h – 13h',
    color: 'var(--color-cool-sage)',
    tips: [
      'Agende tarefas exigentes (análise, escrita, decisões) entre 8h e 12h.',
      'Use o período após o almoço para atividades mais automáticas ou reuniões.',
      'Mantenha o horário de acordar constante — inclusive nos fins de semana.',
      'Se precisar ir a eventos noturnos, tire um breve cochilo (20 min) antes das 15h.',
    ],
  },
  {
    key: 'intermediate',
    label: 'Intermediário',
    animal: '🐦',
    animalName: 'Beija-flor',
    tagline: 'Você é um beija-flor — adaptável, com ritmo equilibrado.',
    description:
      'Seu cronotipo está próximo da média da população. Você consegue funcionar tanto de manhã quanto à noite sem extremos, e se adapta razoavelmente a diferentes rotinas. Sua janela de desempenho é mais ampla que a dos extremos.',
    idealSleep: '23h – 00h',
    idealWake: '7h – 8h',
    peakWindow: '10h – 15h',
    color: 'var(--color-amber-glow)',
    tips: [
      'Aproveite sua flexibilidade, mas estabeleça um horário fixo de acordar para ancorar o ritmo.',
      'Seu pico ligeiramente se estende à tarde — use isso para reuniões e trabalho colaborativo.',
      'Tome cuidado com variações grandes de horário no fim de semana ("jet lag social").',
      'Exponha-se à luz natural logo ao acordar para calibrar seu ritmo circadiano.',
    ],
  },
  {
    key: 'evening',
    label: 'Vespertino',
    animal: '🦉',
    animalName: 'Coruja',
    tagline: 'Você é uma coruja — vira a noite e funciona melhor à tarde.',
    description:
      'Seu relógio biológico está atrasado em relação à média. Você tem dificuldade em adormecer cedo e raramente se sente descansado se for obrigado a acordar cedo. Seu pico real de desempenho ocorre no fim da tarde ou no início da noite.',
    idealSleep: '00h – 01h',
    idealWake: '8h30 – 9h30',
    peakWindow: '14h – 20h',
    color: 'var(--color-cool-plum)',
    tips: [
      'Negocie flexibilidade de horário no trabalho quando possível — isso tem impacto real em produtividade.',
      'Agende tarefas criativas e difíceis para o fim da tarde, não pela manhã.',
      'Use a terapia de luz (10–30 min de luz brilhante logo ao acordar) para adiantar gradualmente seu ritmo.',
      'Evite luz azul (telas) após as 21h — isso agrava o atraso de fase circadiana.',
    ],
  },
  {
    key: 'extreme-evening',
    label: 'Vespertino Extremo',
    animal: '🦉',
    animalName: 'Coruja',
    tagline: 'Você é uma coruja extrema — a noite é seu ambiente natural.',
    description:
      'Seu fase circadiana está significativamente atrasada. Você dorme naturalmente tarde da noite ou de madrugada e acorda no período da tarde. Em rotinas de trabalho convencionais, sofre de privação crônica de sono. Considere discutir com um especialista em medicina do sono sobre Síndrome do Atraso de Fase do Sono.',
    idealSleep: '01h – 03h',
    idealWake: '9h30 – 11h',
    peakWindow: '16h – 22h',
    color: 'var(--color-cool-rose)',
    tips: [
      'Se sua rotina exige acordar cedo, procure um especialista em medicina do sono — há tratamentos para atraso de fase.',
      'Fototerapia matinal (30 min de luz de 10.000 lux) pode ajudar a adiantar seu ritmo gradualmente.',
      'Evite qualquer luz brilhante (incluindo telas) 2h antes de dormir.',
      'Melatonina em dose baixa (0,5 mg) 5h antes do horário de dormir pode ajudar — consulte um médico.',
    ],
  },
];

function getChronotype(score: number): Chronotype {
  const pct = score / MAX_SCORE;
  if (pct < 0.15) return CHRONOTYPES[0]!;
  if (pct < 0.35) return CHRONOTYPES[1]!;
  if (pct < 0.65) return CHRONOTYPES[2]!;
  if (pct < 0.85) return CHRONOTYPES[3]!;
  return CHRONOTYPES[4]!;
}

/* ─── Share dialog ────────────────────────────────────────────────────────── */

function ShareDialog({
  chronotype,
  onClose,
}: {
  chronotype: Chronotype;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    setCanNative(typeof navigator !== 'undefined' && 'share' in navigator);
    setPageUrl(`${window.location.origin}/cronotipo`);
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

  const longText = `Meu cronotipo é ${chronotype.label} (${chronotype.animalName} ${chronotype.animal})

Horário ideal de dormir: ${chronotype.idealSleep}
Horário ideal de acordar: ${chronotype.idealWake}
Janela de pico: ${chronotype.peakWindow}

Descubra o seu cronotipo: ${pageUrl}`;

  const shortText = `Meu cronotipo é ${chronotype.label} (${chronotype.animalName} ${chronotype.animal}). Pico das ${chronotype.peakWindow}. Descubra o seu:`;

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
      await navigator.share({ title: 'Meu Cronotipo de Sono', text: shortText, url: pageUrl });
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
      aria-labelledby="share-crono-title"
    >
      <div
        className="w-full max-w-md bg-[var(--color-ink-night)] border border-[var(--color-border)] rounded-t-2xl sm:rounded-2xl p-6 sm:p-7 max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="kicker mb-1" id="share-crono-title">Compartilhar resultado</p>
            <p className="text-xs text-[var(--color-text-faint)]">Descubra o cronotipo dos seus amigos</p>
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

/* ─── Option card ─────────────────────────────────────────────────────────── */

function OptionCard({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl border px-4 py-3.5 transition-colors flex items-center gap-3 ${
        selected
          ? 'border-[var(--color-amber-glow)] bg-[var(--color-amber-ember)]'
          : 'border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-amber-glow)]/50'
      }`}
    >
      <span
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          selected ? 'border-[var(--color-amber-glow)]' : 'border-[var(--color-border)]'
        }`}
      >
        {selected && <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-amber-glow)] block" />}
      </span>
      <span className="serif text-sm leading-snug">{label}</span>
    </button>
  );
}

/* ─── Other tools ─────────────────────────────────────────────────────────── */

const OTHER_TOOLS = [
  { href: '/teste', label: 'Teste de Qualidade do Sono' },
  { href: '/ciclos', label: 'Calculadora de Ciclos de Sono' },
  { href: '/divida-de-sono', label: 'Calculadora de Dívida de Sono' },
  { href: '/apneia', label: 'Triagem de Apneia (STOP-BANG)' },
];

/* ─── Views ───────────────────────────────────────────────────────────────── */

function IntroView({ onStart }: { onStart: () => void }) {
  return (
    <div className="container mx-auto max-w-2xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="text-center">
        <p className="kicker mb-5">Ferramenta gratuita</p>
        <h1 className="serif text-4xl sm:text-5xl font-normal leading-tight tracking-tight mb-6">
          Calculadora de Cronotipo
        </h1>
        <p className="serif text-lg text-[var(--color-muted)] leading-relaxed mb-10 max-w-lg mx-auto">
          Seu cronotipo é o seu ritmo circadiano natural — a programação interna que define
          quando você tem sono, quando acorda e quando rende mais. Descubra o seu em
          6 perguntas.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10 text-left">
          {[
            { icon: '🐦', label: 'Matutino', desc: 'Cotovia — acorda cedo, pico de manhã' },
            { icon: '🐦', label: 'Intermediário', desc: 'Beija-flor — ritmo equilibrado e flexível' },
            { icon: '🦉', label: 'Vespertino', desc: 'Coruja — pico no fim da tarde ou noite' },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
              <p className="text-2xl mb-2">{c.icon}</p>
              <p className="serif text-base font-normal text-[var(--color-text-moon)]">{c.label}</p>
              <p className="text-xs text-[var(--color-muted)] mt-1 leading-snug">{c.desc}</p>
            </div>
          ))}
        </div>

        <button onClick={onStart} className="btn-primary text-base px-8">
          Descobrir meu cronotipo →
        </button>
        <p className="text-xs text-[var(--color-text-faint)] mt-5">
          6 perguntas · Sem cadastro · Resultado imediato
        </p>
      </div>
    </div>
  );
}

function QuestionView({
  answers,
  onAnswer,
  onFinish,
}: {
  answers: Record<string, number>;
  onAnswer: (id: string, score: number) => void;
  onFinish: () => void;
}) {
  const answered = QUESTIONS.filter((q) => answers[q.id] !== undefined).length;
  const allAnswered = answered === QUESTIONS.length;
  const progress = (answered / QUESTIONS.length) * 100;

  return (
    <div className="container mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-[var(--color-text-faint)]">Calculadora de Cronotipo</span>
          <span className="text-xs text-[var(--color-text-faint)]">{answered}/{QUESTIONS.length} respondidas</span>
        </div>
        <div className="h-1 rounded-full bg-[var(--color-ink-fog)]">
          <div className="h-1 rounded-full bg-[var(--color-amber-glow)] transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <p className="kicker mb-6">Sobre seus hábitos naturais de sono</p>

      <div className="space-y-8">
        {QUESTIONS.map((q, qi) => (
          <div key={q.id}>
            <p className="serif text-base font-normal leading-snug mb-3">
              <span className="font-mono text-xs text-[var(--color-text-faint)] mr-2">{qi + 1}.</span>
              {q.text}
            </p>
            <div className="space-y-2">
              {q.options.map((opt) => (
                <OptionCard
                  key={opt.label}
                  label={opt.label}
                  selected={answers[q.id] === opt.score}
                  onClick={() => onAnswer(q.id, opt.score)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-[var(--color-border)]">
        <button
          onClick={onFinish}
          disabled={!allAnswered}
          className={`btn-primary text-sm w-full justify-center ${!allAnswered ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          Ver meu cronotipo →
        </button>
        {!allAnswered && (
          <p className="text-xs text-[var(--color-text-faint)] text-center mt-3">
            Responda todas as {QUESTIONS.length} perguntas para ver o resultado
          </p>
        )}
      </div>
    </div>
  );
}

function ResultView({
  chronotype,
  onRestart,
}: {
  chronotype: Chronotype;
  onRestart: () => void;
}) {
  const [showShare, setShowShare] = useState(false);

  return (
    <div className="container mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="kicker mb-4">Seu cronotipo</p>
        <div className="text-6xl mb-4" aria-hidden>{chronotype.animal}</div>
        <h1
          className="serif text-4xl sm:text-5xl font-normal tracking-tight mb-2"
          style={{ color: chronotype.color }}
        >
          {chronotype.label}
        </h1>
        <p className="serif text-base text-[var(--color-muted)] mt-3 leading-relaxed max-w-sm mx-auto">
          {chronotype.tagline}
        </p>
      </div>

      {/* Description */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 sm:p-8 mb-6">
        <p className="kicker mb-3">O que isso significa</p>
        <p className="serif text-base text-[var(--color-muted)] leading-relaxed">
          {chronotype.description}
        </p>
      </section>

      {/* Schedule */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 sm:p-8 mb-6">
        <p className="kicker mb-5">Horários ideais para você</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Dormir', value: chronotype.idealSleep },
            { label: 'Acordar', value: chronotype.idealWake },
            { label: 'Pico de rendimento', value: chronotype.peakWindow },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-ink-night)] p-4">
              <p className="text-xs text-[var(--color-text-faint)] mb-1">{item.label}</p>
              <p className="serif text-lg font-normal" style={{ color: chronotype.color }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="mb-6">
        <p className="kicker mb-4">Como aproveitar seu cronotipo</p>
        <div className="space-y-3">
          {chronotype.tips.map((tip, i) => (
            <div key={i} className="flex gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
              <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: chronotype.color }} aria-hidden />
              <p className="serif text-sm text-[var(--color-muted)] leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Share */}
      <section
        className="rounded-2xl border border-[var(--color-amber-glow)]/30 p-6 mb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--color-amber-ember) 0%, transparent 70%)' }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex-1">
            <p className="kicker mb-2">Compartilhar</p>
            <p className="serif text-base text-[var(--color-text-moon)] leading-snug">
              Descubra o cronotipo dos seus amigos.
            </p>
            <p className="text-sm text-[var(--color-muted)] mt-1">
              Seu resultado: {chronotype.label} {chronotype.animal}
            </p>
          </div>
          <button onClick={() => setShowShare(true)} className="btn-primary text-sm whitespace-nowrap w-full sm:w-auto">
            Compartilhar →
          </button>
        </div>
      </section>

      {/* Disclaimer + restart */}
      <div className="text-center mb-8">
        <p className="text-xs text-[var(--color-text-faint)] leading-relaxed mb-5 max-w-sm mx-auto">
          Este teste é orientativo. O cronotipo pode variar com idade, estação do ano e estilo de vida.
          Dificuldades extremas de sono merecem avaliação médica especializada.
        </p>
        <button onClick={onRestart} className="btn-ghost text-sm">Refazer o teste</button>
      </div>

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

      {showShare && <ShareDialog chronotype={chronotype} onClose={() => setShowShare(false)} />}
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────────── */

export default function CronotipoCliente() {
  const [view, setView] = useState<'intro' | 'questions' | 'result'>('intro');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [chronotype, setChronotype] = useState<Chronotype | null>(null);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [view]);

  function handleAnswer(id: string, score: number) {
    setAnswers((prev) => ({ ...prev, [id]: score }));
  }

  function handleFinish() {
    const total = QUESTIONS.reduce((acc, q) => acc + (answers[q.id] ?? 0), 0);
    setChronotype(getChronotype(total));
    setView('result');
  }

  function handleRestart() {
    setView('intro');
    setAnswers({});
    setChronotype(null);
  }

  if (view === 'intro') return <IntroView onStart={() => setView('questions')} />;
  if (view === 'result' && chronotype) return <ResultView chronotype={chronotype} onRestart={handleRestart} />;

  return <QuestionView answers={answers} onAnswer={handleAnswer} onFinish={handleFinish} />;
}
