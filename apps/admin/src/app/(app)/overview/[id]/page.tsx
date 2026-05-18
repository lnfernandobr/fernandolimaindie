'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { AuditMetrics, ChannelDto, LighthouseStrategy } from '@fernandolimaindie/shared';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import {
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  XCircle,
  Sparkles,
  Smartphone,
  Monitor,
} from 'lucide-react';

type Strategy = 'mobile' | 'desktop';

export default function OverviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [channel, setChannel] = useState<ChannelDto | null>(null);
  const [audit, setAudit] = useState<AuditMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [strategy, setStrategy] = useState<Strategy>('mobile');

  async function load(forceRefresh = false) {
    setLoading(!forceRefresh);
    if (forceRefresh) setRefreshing(true);
    try {
      const ch = await api<ChannelDto>(`/api/v1/channels/${id}`);
      setChannel(ch);
      const a = await api<AuditMetrics>(
        `/api/v1/channels/${id}/audit${forceRefresh ? '?refresh=true' : ''}`,
      );
      setAudit(a);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao carregar audit');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function requestAI() {
    setAiLoading(true);
    try {
      const a = await api<AuditMetrics>(`/api/v1/channels/${id}/audit?ai=true`);
      setAudit(a);
      toast.success('Análise da IA gerada');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao gerar análise da IA');
    } finally {
      setAiLoading(false);
    }
  }

  useEffect(() => {
    void load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <PageHeader title="Carregando…" />;
  if (!channel || !audit) return <PageHeader title="Não encontrado" />;

  const lh = strategy === 'mobile' ? audit.pagespeed?.mobile : audit.pagespeed?.desktop;
  const psiError = audit.pagespeed?.error;

  return (
    <div className="space-y-6">
      <PageHeader
        title={channel.name}
        description={
          <span className="inline-flex items-center gap-2 text-sm flex-wrap">
            <a
              href={channel.siteUrl}
              target="_blank"
              rel="noopener"
              className="text-[var(--color-accent)] hover:underline inline-flex items-center gap-1"
            >
              {channel.siteUrl} <ExternalLink className="h-3 w-3" />
            </a>
            <span className="text-[var(--color-muted)]">
              · auditado em {new Date(audit.fetchedAt).toLocaleString('pt-BR')}
            </span>
          </span>
        }
        actions={
          <Button variant="outline" onClick={() => void load(true)} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Atualizar agora
          </Button>
        }
      />

      {!audit.reachable ? (
        <Card>
          <CardContent className="py-8 flex items-center gap-3 text-red-600">
            <XCircle className="h-5 w-5" />
            <span>O site não respondeu. Verifique o domínio e a hospedagem.</span>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Lighthouse (PageSpeed Insights)</CardTitle>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              Scores e Core Web Vitals do Google.{' '}
              {audit.pagespeed?.fetchedAt
                ? `Coleta: ${new Date(audit.pagespeed.fetchedAt).toLocaleString('pt-BR')}`
                : 'Ainda não coletado.'}
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Button
              size="sm"
              variant={strategy === 'mobile' ? 'default' : 'outline'}
              onClick={() => setStrategy('mobile')}
            >
              <Smartphone className="h-3 w-3" /> Mobile
            </Button>
            <Button
              size="sm"
              variant={strategy === 'desktop' ? 'default' : 'outline'}
              onClick={() => setStrategy('desktop')}
            >
              <Monitor className="h-3 w-3" /> Desktop
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {psiError ? (
            <p className="text-sm text-red-600 mb-2">PSI: {psiError}</p>
          ) : null}
          {!lh ? (
            <p className="text-sm text-[var(--color-muted)]">
              Sem dados pra {strategy}. Pode ser rate limit do PSI sem API key, ou o site não está
              acessível pelo Google. Tente “Atualizar agora”.
            </p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <ScoreCard title="Performance" score={lh.scores.performance} />
                <ScoreCard title="Accessibility" score={lh.scores.accessibility} />
                <ScoreCard title="Best Practices" score={lh.scores.bestPractices} />
                <ScoreCard title="SEO" score={lh.scores.seo} />
              </div>

              <div className="mt-6">
                <h3 className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-3">
                  Core Web Vitals
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Vital label="LCP" value={fmtMs(lh.metrics.lcp)} good="<2.5s" bad=">4s" status={vitalStatus(lh.metrics.lcp, 2500, 4000)} />
                  <Vital label="CLS" value={fmtUnit(lh.metrics.cls)} good="<0.1" bad=">0.25" status={vitalStatus(lh.metrics.cls, 0.1, 0.25)} />
                  <Vital label="INP" value={fmtMs(lh.metrics.inp)} good="<200ms" bad=">500ms" status={vitalStatus(lh.metrics.inp, 200, 500)} />
                  <Vital label="FCP" value={fmtMs(lh.metrics.fcp)} good="<1.8s" bad=">3s" status={vitalStatus(lh.metrics.fcp, 1800, 3000)} />
                  <Vital label="TTFB" value={fmtMs(lh.metrics.ttfb)} good="<800ms" bad=">1.8s" status={vitalStatus(lh.metrics.ttfb, 800, 1800)} />
                  <Vital label="TBT" value={fmtMs(lh.metrics.tbt)} good="<200ms" bad=">600ms" status={vitalStatus(lh.metrics.tbt, 200, 600)} />
                  <Vital label="Speed Index" value={fmtMs(lh.metrics.si)} good="<3.4s" bad=">5.8s" status={vitalStatus(lh.metrics.si, 3400, 5800)} />
                </div>
                {lh.metrics.inp === null ? (
                  <p className="text-xs text-[var(--color-muted)] mt-3">
                    INP só vem com dados de campo (CrUX) — sites com tráfego baixo não têm. Os outros
                    são lab.
                  </p>
                ) : null}
              </div>

              {lh.topIssues.length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-3">
                    Principais issues do Lighthouse ({strategy})
                  </h3>
                  <ul className="space-y-2">
                    {lh.topIssues.map((it) => (
                      <li key={it.id} className="text-sm flex items-start gap-3">
                        <Badge variant="secondary" className="text-[10px] mt-0.5">{it.category}</Badge>
                        <div className="flex-1">
                          <span>{it.title}</span>
                          {it.displayValue ? (
                            <span className="text-[var(--color-muted)] ml-2 text-xs">
                              ({it.displayValue})
                            </span>
                          ) : null}
                        </div>
                        <span className={`text-xs ${scoreColor(scoreToInt(it.score))}`}>
                          {scoreToInt(it.score)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">GEO (citação por LLMs)</CardTitle>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              Sinais que ajudam o site ser citado por ChatGPT, Claude, Perplexity, Gemini.
            </p>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <Check label="JSON-LD na home" ok={audit.geo.hasJsonLd} extra={`${audit.geo.jsonLdCount} bloco(s)`} />
            <Check label="/llms.txt" ok={audit.geo.hasLlmsTxt} />
            <Check label="Feed RSS / Atom" ok={audit.geo.hasRssFeed} />
            <Check label="Bots de IA permitidos no robots.txt" ok={audit.geo.botsAllowed} />
            <div className="pt-3 mt-2 border-t">
              <span className="text-xs text-[var(--color-muted)]">Score GEO: </span>
              <span className={`font-semibold ${scoreColor(audit.geo.score)}`}>
                {audit.geo.score}/100
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Visitas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-muted)]">{audit.visits.message}</p>
            <p className="text-xs text-[var(--color-muted)] mt-2">
              Quando integrar Plausible/Umami/GA, este card vai mostrar pageviews e uniques.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pontos de melhoria (técnico)</CardTitle>
        </CardHeader>
        <CardContent>
          {audit.recommendations.length === 0 ? (
            <p className="text-sm text-green-600 inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Nenhum ponto crítico.
            </p>
          ) : (
            <ul className="space-y-2">
              {audit.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <SeverityIcon severity={r.severity} />
                  <div className="flex-1">
                    <span className="text-[var(--color-fg)]">{r.message}</span>
                    <Badge variant="secondary" className="ml-2 text-[10px]">{r.area}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
              Análise da IA (qualitativa)
            </CardTitle>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              Conteúdo, autoridade e oportunidades — coisas que Lighthouse não pega.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={requestAI} disabled={aiLoading}>
            <Sparkles className={`h-4 w-4 ${aiLoading ? 'animate-pulse' : ''}`} />
            {audit.aiInsights ? 'Refazer análise' : 'Pedir análise da IA'}
          </Button>
        </CardHeader>
        <CardContent>
          {audit.aiInsights ? (
            <>
              <p className="text-xs text-[var(--color-muted)] mb-3">
                Gerada em {new Date(audit.aiInsights.generatedAt).toLocaleString('pt-BR')} ·{' '}
                provider <code>{audit.aiInsights.provider}</code>
              </p>
              {audit.aiInsights.insights.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">A IA não retornou insights.</p>
              ) : (
                <ul className="space-y-3">
                  {audit.aiInsights.insights.map((it, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 border-l-2 pl-3"
                      style={{
                        borderColor:
                          it.severity === 'high'
                            ? 'rgb(220 38 38)'
                            : it.severity === 'medium'
                              ? 'rgb(202 138 4)'
                              : 'rgb(37 99 235)',
                      }}
                    >
                      <SeverityIcon severity={it.severity} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <span className="font-medium text-sm">{it.title}</span>
                          <Badge variant="secondary" className="text-[10px]">{it.area}</Badge>
                          <Badge
                            variant={
                              it.severity === 'high'
                                ? 'error'
                                : it.severity === 'medium'
                                  ? 'warn'
                                  : 'default'
                            }
                            className="text-[10px]"
                          >
                            {it.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-[var(--color-muted)]">{it.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="text-sm text-[var(--color-muted)]">
              Nenhuma análise da IA gerada ainda. Clique em <em>Pedir análise da IA</em> para uma
              leitura qualitativa do site.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ScoreCard({ title, score }: { title: string; score: number | null }) {
  const display = score === null ? '—' : score;
  const color = score === null ? 'text-[var(--color-muted)]' : scoreColor(score);
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-sm text-[var(--color-muted)]">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-4xl font-semibold ${color}`}>{display}</div>
      </CardContent>
    </Card>
  );
}

function Vital({
  label,
  value,
  good,
  bad,
  status,
}: {
  label: string;
  value: string;
  good: string;
  bad: string;
  status: 'good' | 'warn' | 'bad' | 'na';
}) {
  const color =
    status === 'good'
      ? 'text-green-600'
      : status === 'warn'
        ? 'text-yellow-600'
        : status === 'bad'
          ? 'text-red-600'
          : 'text-[var(--color-muted)]';
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">{label}</div>
      <div className={`text-xl font-semibold mt-1 ${color}`}>{value}</div>
      <div className="text-[10px] text-[var(--color-muted)] mt-1">
        bom {good} · ruim {bad}
      </div>
    </div>
  );
}

function Check({ label, ok, extra }: { label: string; ok: boolean; extra?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-2">
        {ok ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-red-600" />
        )}
        {label}
      </span>
      {extra ? <span className="text-xs text-[var(--color-muted)]">{extra}</span> : null}
    </div>
  );
}

function SeverityIcon({ severity }: { severity: 'high' | 'medium' | 'low' }) {
  if (severity === 'high') return <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />;
  if (severity === 'medium') return <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />;
  return <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />;
}

function scoreColor(score: number | null): string {
  if (score === null) return 'text-[var(--color-muted)]';
  if (score >= 90) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

function scoreToInt(s: number | null): number {
  if (s === null || s === undefined) return 0;
  return Math.round(s * 100);
}

function fmtMs(v: number | null): string {
  if (v === null) return '—';
  if (v >= 1000) return `${(v / 1000).toFixed(1)}s`;
  return `${Math.round(v)}ms`;
}

function fmtUnit(v: number | null): string {
  if (v === null) return '—';
  return v.toFixed(2);
}

function vitalStatus(v: number | null, goodMax: number, badMin: number): 'good' | 'warn' | 'bad' | 'na' {
  if (v === null) return 'na';
  if (v <= goodMax) return 'good';
  if (v >= badMin) return 'bad';
  return 'warn';
}
