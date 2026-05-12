'use client';

import { useState, useLayoutEffect, useEffect } from 'react';
import Link from 'next/link';

/* ─── STOP-BANG questions ─────────────────────────────────────────────────── */

interface Question {
  id: string;
  letter: string;
  text: string;
  detail?: string;
}

const QUESTIONS: Question[] = [
  {
    id: 'S',
    letter: 'S',
    text: 'Você ronca (ou te dizem que ronca) de forma alta?',
    detail: 'Ronco audível em outro cômodo ou que incomoda quem dorme no mesmo quarto.',
  },
  {
    id: 'T',
    letter: 'T',
    text: 'Você frequentemente se sente cansado(a), fatigado(a) ou sonolento(a) durante o dia?',
    detail: 'Sonolência diurna mesmo após uma noite de sono aparentemente adequada.',
  },
  {
    id: 'O',
    letter: 'O',
    text: 'Alguém já observou que você para de respirar durante o sono?',
    detail: 'Pausas respiratórias relatadas por parceiro(a), familiar ou companheiro(a) de quarto.',
  },
  {
    id: 'P',
    letter: 'P',
    text: 'Você tem ou trata pressão alta (hipertensão arterial)?',
    detail: 'Inclui casos em tratamento com medicamentos anti-hipertensivos.',
  },
  {
    id: 'B',
    letter: 'B',
    text: 'Seu Índice de Massa Corporal (IMC) é maior que 35?',
    detail: 'IMC = peso (kg) ÷ altura² (m). IMC > 35 corresponde a obesidade grau II.',
  },
  {
    id: 'A',
    letter: 'A',
    text: 'Você tem mais de 50 anos de idade?',
    detail: 'O risco de apneia aumenta progressivamente após os 50 anos.',
  },
  {
    id: 'N',
    letter: 'N',
    text: 'Sua circunferência cervical (pescoço) é maior que 40 cm?',
    detail: 'Meça com uma fita métrica ao redor do pescoço, na altura da laringe (pomo-de-adão).',
  },
  {
    id: 'G',
    letter: 'G',
    text: 'Você é do sexo masculino?',
    detail: 'Homens têm risco 2 a 3× maior de apneia obstrutiva do sono que mulheres.',
  },
];

/* ─── Risk levels ─────────────────────────────────────────────────────────── */

interface RiskLevel {
  label: string;
  description: string;
  action: string;
  color: string;
  bgColor: string;
}

const RISK_LEVELS: RiskLevel[] = [
  {
    label: 'Baixo Risco',
    description: 'Seu resultado sugere baixo risco de apneia obstrutiva do sono com base nos critérios STOP-BANG.',
    action: 'Mantenha hábitos saudáveis. Se notar ronco frequente, cansaço diurno excessivo ou pausas respiratórias relatadas, refaça a triagem ou consulte um médico.',
    color: 'var(--color-cool-sage)',
    bgColor: 'rgba(var(--color-cool-sage-rgb, 100, 180, 120), 0.1)',
  },
  {
    label: 'Risco Intermediário',
    description: 'Seu resultado indica risco intermediário de apneia obstrutiva do sono. A presença de 3 a 4 fatores merece avaliação mais cuidadosa.',
    action: 'Converse com seu médico sobre seus sintomas de sono. Ele pode solicitar uma polissonografia ou oximetria noturna para avaliação mais completa.',
    color: 'var(--color-amber-glow)',
    bgColor: 'rgba(var(--color-amber-glow-rgb, 200, 150, 80), 0.1)',
  },
  {
    label: 'Alto Risco',
    description: 'Seu resultado indica alto risco de apneia obstrutiva do sono. Com 5 ou mais fatores do STOP-BANG, a probabilidade de AOS moderada a grave é clinicamente significativa.',
    action: 'Procure um especialista em medicina do sono ou otorrinolaringologista com urgência. A apneia não tratada está associada a hipertensão, doença cardiovascular, diabetes e acidentes. O tratamento com CPAP é altamente eficaz.',
    color: 'var(--color-cool-rose)',
    bgColor: 'rgba(var(--color-cool-rose-rgb, 200, 100, 120), 0.1)',
  },
];

function getRiskLevel(score: number): RiskLevel {
  if (score <= 2) return RISK_LEVELS[0]!;
  if (score <= 4) return RISK_LEVELS[1]!;
  return RISK_LEVELS[2]!;
}

/* ─── Share dialog ────────────────────────────────────────────────────────── */

function ShareDialog({
  score,
  risk,
  onClose,
}: {
  score: number;
  risk: RiskLevel;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    setCanNative(typeof navigator !== 'undefined' && 'share' in navigator);
    setPageUrl(`${window.location.origin}/apneia`);
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

  const longText = `Meu risco de apneia do sono pelo questionário STOP-BANG: ${risk.label} (${score}/8 fatores).

Faça sua triagem gratuita: ${pageUrl}`;
  const shortText = `Meu risco de apneia (STOP-BANG) é ${risk.label} — ${score}/8 fatores. Faça o seu:`;

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
      await navigator.share({ title: 'Triagem de Apneia STOP-BANG', text: shortText, url: pageUrl });
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
      aria-labelledby="share-apneia-title"
    >
      <div
        className="w-full max-w-md bg-[var(--color-ink-night)] border border-[var(--color-border)] rounded-t-2xl sm:rounded-2xl p-6 sm:p-7 max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="kicker mb-1" id="share-apneia-title">Compartilhar resultado</p>
            <p className="text-xs text-[var(--color-text-faint)]">Incentive quem você conhece a fazer a triagem</p>
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

/* ─── Other tools ─────────────────────────────────────────────────────────── */

const OTHER_TOOLS = [
  { href: '/teste', label: 'Teste de Qualidade do Sono' },
  { href: '/ciclos', label: 'Calculadora de Ciclos de Sono' },
  { href: '/cronotipo', label: 'Calculadora de Cronotipo' },
  { href: '/divida-de-sono', label: 'Calculadora de Dívida de Sono' },
];

/* ─── Views ───────────────────────────────────────────────────────────────── */

function IntroView({ onStart }: { onStart: () => void }) {
  return (
    <div className="container mx-auto max-w-2xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="text-center">
        <p className="kicker mb-5">Triagem clínica gratuita</p>
        <h1 className="serif text-4xl sm:text-5xl font-normal leading-tight tracking-tight mb-6">
          Triagem de Apneia do Sono
        </h1>
        <p className="serif text-lg text-[var(--color-muted)] leading-relaxed mb-10 max-w-lg mx-auto">
          A apneia obstrutiva do sono afeta cerca de 30% dos adultos e permanece não diagnosticada
          na maioria dos casos. O questionário STOP-BANG é o instrumento de triagem mais
          utilizado mundialmente em contextos clínicos.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 text-left">
          {[
            { abbr: 'STOP', label: 'Sintomas principais' },
            { abbr: 'BANG', label: 'Fatores de risco' },
            { abbr: '8', label: 'Perguntas sim/não' },
            { abbr: '<2 min', label: 'Para completar' },
          ].map(({ abbr, label }) => (
            <div key={abbr} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
              <p className="font-mono text-xs text-[var(--color-amber-glow)] mb-1.5">{abbr}</p>
              <p className="text-sm text-[var(--color-muted)] leading-snug">{label}</p>
            </div>
          ))}
        </div>

        <button onClick={onStart} className="btn-primary text-base px-8">
          Iniciar triagem →
        </button>

        <p className="text-xs text-[var(--color-text-faint)] mt-5">
          Sem cadastro · Resultado imediato · Ferramenta informativa
        </p>
        <p className="text-xs text-[var(--color-text-faint)] mt-2 max-w-sm mx-auto leading-relaxed">
          Esta triagem não substitui avaliação médica. Um resultado de alto risco requer
          confirmação por polissonografia ou oximetria noturna.
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
  answers: Record<string, boolean | undefined>;
  onAnswer: (id: string, v: boolean) => void;
  onFinish: () => void;
}) {
  const answered = QUESTIONS.filter((q) => answers[q.id] !== undefined).length;
  const allAnswered = answered === QUESTIONS.length;
  const progress = (answered / QUESTIONS.length) * 100;

  return (
    <div className="container mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-[var(--color-text-faint)]">Questionário STOP-BANG</span>
          <span className="text-xs text-[var(--color-text-faint)]">{answered}/{QUESTIONS.length} respondidas</span>
        </div>
        <div className="h-1 rounded-full bg-[var(--color-ink-fog)]">
          <div className="h-1 rounded-full bg-[var(--color-amber-glow)] transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <p className="kicker mb-2">Triagem de Apneia do Sono</p>
      <p className="serif text-sm text-[var(--color-muted)] mb-8 leading-relaxed">
        Responda com base na sua situação atual. Não existe resposta certa ou errada.
      </p>

      <div className="space-y-5">
        {QUESTIONS.map((q, qi) => (
          <div key={q.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
            {/* Letter badge */}
            <div className="flex items-start gap-3 mb-4">
              <span className="w-7 h-7 rounded-lg bg-[var(--color-ink-fog)] flex items-center justify-center font-mono text-xs text-[var(--color-amber-glow)] flex-shrink-0 mt-0.5">
                {q.letter}
              </span>
              <div>
                <p className="serif text-sm font-normal leading-snug text-[var(--color-text-moon)]">
                  <span className="font-mono text-[10px] text-[var(--color-text-faint)] mr-1">{qi + 1}.</span>
                  {q.text}
                </p>
                {q.detail && (
                  <p className="text-xs text-[var(--color-text-faint)] mt-1 leading-relaxed">{q.detail}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Sim', value: true },
                { label: 'Não', value: false },
              ].map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onAnswer(q.id, value)}
                  className={`rounded-xl border px-4 py-3 serif text-sm transition-colors ${
                    answers[q.id] === value
                      ? 'border-[var(--color-amber-glow)] bg-[var(--color-amber-ember)] text-[var(--color-text-moon)]'
                      : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-amber-glow)]/50'
                  }`}
                >
                  {label}
                </button>
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
          Ver resultado →
        </button>
        {!allAnswered && (
          <p className="text-xs text-[var(--color-text-faint)] text-center mt-3">
            Responda todas as 8 perguntas para ver o resultado
          </p>
        )}
      </div>
    </div>
  );
}

function ResultView({
  score,
  answers,
  onRestart,
}: {
  score: number;
  answers: Record<string, boolean | undefined>;
  onRestart: () => void;
}) {
  const risk = getRiskLevel(score);
  const [showShare, setShowShare] = useState(false);
  const positive = QUESTIONS.filter((q) => answers[q.id] === true);

  return (
    <div className="container mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-16">
      {/* Score header */}
      <div className="text-center mb-10">
        <p className="kicker mb-6">Resultado STOP-BANG</p>

        {/* Score circle */}
        <div className="flex justify-center mb-6">
          <div
            className="relative w-36 h-36 rounded-full flex items-center justify-center"
            style={{
              background: `conic-gradient(${risk.color} 0% ${(score / 8) * 100}%, var(--color-ink-fog) ${(score / 8) * 100}% 100%)`,
            }}
            role="img"
            aria-label={`Pontuação STOP-BANG: ${score} de 8`}
          >
            <div className="w-[104px] h-[104px] rounded-full bg-[var(--color-ink-night)] flex flex-col items-center justify-center">
              <span className="serif text-4xl font-normal leading-none">{score}</span>
              <span className="text-xs text-[var(--color-text-faint)] mt-1">/ 8</span>
            </div>
          </div>
        </div>

        <h1 className="serif text-3xl sm:text-4xl font-normal tracking-tight mb-3" style={{ color: risk.color }}>
          {risk.label}
        </h1>
        <p className="serif text-base text-[var(--color-muted)] leading-relaxed max-w-sm mx-auto">
          {risk.description}
        </p>
      </div>

      {/* What this means */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 sm:p-8 mb-6">
        <p className="kicker mb-3">Próximos passos</p>
        <p className="serif text-base text-[var(--color-muted)] leading-relaxed">{risk.action}</p>
      </section>

      {/* Positive factors */}
      {positive.length > 0 && (
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 mb-6">
          <p className="kicker mb-4">Fatores de risco identificados</p>
          <div className="space-y-2">
            {positive.map((q) => (
              <div key={q.id} className="flex items-start gap-3">
                <span
                  className="w-6 h-6 rounded-md flex items-center justify-center font-mono text-[10px] flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: risk.color, color: 'var(--color-ink-night)' }}
                >
                  {q.letter}
                </span>
                <p className="serif text-sm text-[var(--color-muted)] leading-snug">{q.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* STOP-BANG explanation */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 mb-6">
        <p className="kicker mb-4">Sobre o STOP-BANG</p>
        <div className="space-y-2">
          {[
            { letter: 'S', full: 'Snoring (Ronco)' },
            { letter: 'T', full: 'Tired (Cansaço diurno)' },
            { letter: 'O', full: 'Observed (Pausas respiratórias observadas)' },
            { letter: 'P', full: 'Pressure (Hipertensão arterial)' },
            { letter: 'B', full: 'BMI > 35 (IMC > 35)' },
            { letter: 'A', full: 'Age > 50 (Idade > 50 anos)' },
            { letter: 'N', full: 'Neck > 40 cm (Pescoço > 40 cm)' },
            { letter: 'G', full: 'Gender Male (Sexo masculino)' },
          ].map(({ letter, full }) => (
            <div key={letter} className="flex items-center gap-3">
              <span className="font-mono text-xs text-[var(--color-amber-glow)] w-4 flex-shrink-0">{letter}</span>
              <span className="serif text-sm text-[var(--color-muted)]">{full}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-[var(--color-text-faint)] mt-4 leading-relaxed">
          Referência: Chung F et al. STOP questionnaire: a tool to screen patients for obstructive sleep apnea.
          Anesthesiology. 2008;108(5):812–821.
        </p>
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
              Incentive quem você conhece a fazer a triagem.
            </p>
            <p className="text-sm text-[var(--color-muted)] mt-1">
              A apneia não diagnosticada é muito mais comum do que se imagina.
            </p>
          </div>
          <button onClick={() => setShowShare(true)} className="btn-primary text-sm whitespace-nowrap w-full sm:w-auto">
            Compartilhar →
          </button>
        </div>
      </section>

      {/* Disclaimer + restart */}
      <div className="text-center mb-8">
        <p className="text-xs text-[var(--color-text-faint)] leading-relaxed mb-5 max-w-md mx-auto">
          Este questionário é uma ferramenta de triagem e não constitui diagnóstico médico.
          O diagnóstico definitivo de apneia do sono requer polissonografia ou oximetria
          noturna supervisionada por médico especialista.
        </p>
        <button onClick={onRestart} className="btn-ghost text-sm">Refazer a triagem</button>
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

      {showShare && <ShareDialog score={score} risk={risk} onClose={() => setShowShare(false)} />}
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────────── */

export default function ApneiaCliente() {
  const [view, setView] = useState<'intro' | 'questions' | 'result'>('intro');
  const [answers, setAnswers] = useState<Record<string, boolean | undefined>>({});
  const [score, setScore] = useState(0);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [view]);

  function handleAnswer(id: string, v: boolean) {
    setAnswers((prev) => ({ ...prev, [id]: v }));
  }

  function handleFinish() {
    const total = QUESTIONS.filter((q) => answers[q.id] === true).length;
    setScore(total);
    setView('result');
  }

  function handleRestart() {
    setView('intro');
    setAnswers({});
    setScore(0);
  }

  if (view === 'intro') return <IntroView onStart={() => setView('questions')} />;
  if (view === 'result') return <ResultView score={score} answers={answers} onRestart={handleRestart} />;

  return <QuestionView answers={answers} onAnswer={handleAnswer} onFinish={handleFinish} />;
}
