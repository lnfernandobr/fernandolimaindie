import type { AuditMetrics, GeoCheck, LighthouseStrategy, PagespeedReport } from '@fernandolimaindie/shared';
import { logger } from '../config/logger.js';
import { analyzeSite } from '../ai/index.js';
import { runPagespeed } from './pagespeed.js';

/**
 * Audit do site externo do canal.
 *
 * Composição:
 *   - PageSpeed Insights (Google) → Performance, Accessibility, Best Practices, SEO
 *     com Lighthouse oficial e Core Web Vitals reais. Cobre o "tradicional".
 *   - GEO check (próprio) → bots de IA permitidos, llms.txt, RSS, JSON-LD presente.
 *     É a parte que Lighthouse não cobre — citação por LLMs.
 *   - aiInsights (opt-in) → análise qualitativa via LLM.
 *
 * O fetch direto do site é feito apenas pra GEO (precisamos parsear robots.txt,
 * verificar llms.txt etc.). Performance/SEO técnico ficam por conta do Google.
 */

const FETCH_TIMEOUT_MS = 10_000;

const AI_BOTS = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'PerplexityBot'];

export interface RunAuditOpts {
  /** Roda também a task `analyzeSite` da camada de IA. */
  withAI?: boolean;
  /** Pula o PageSpeed Insights (útil pra refresh só de GEO/IA). */
  skipPagespeed?: boolean;
  channelName?: string;
  niche?: string;
}

export async function runAudit(siteUrl: string, opts: RunAuditOpts = {}): Promise<AuditMetrics> {
  const baseUrl = siteUrl.replace(/\/$/, '');
  const fetchedAt = new Date().toISOString();

  // 1) PageSpeed Insights (assíncrono, custoso) + GEO check (rápido) em paralelo
  const [pagespeed, geoData] = await Promise.all([
    opts.skipPagespeed ? Promise.resolve<PagespeedReport | null>(null) : runPagespeed(baseUrl),
    runGeoCheck(baseUrl),
  ]);

  const reachable = isReachable(pagespeed, geoData);

  const recommendations = buildRecommendations(pagespeed, geoData);

  const result: AuditMetrics = {
    fetchedAt,
    reachable,
    pagespeed,
    geo: geoData,
    visits: {
      tracked: false,
      message: 'Sem integração de analytics. Conecte Plausible/Umami/GA depois.',
    },
    recommendations,
  };

  if (opts.withAI) {
    try {
      const ai = await analyzeSite({
        channelName: opts.channelName ?? siteUrl,
        niche: opts.niche ?? 'geral',
        siteUrl,
        htmlSample: geoData._htmlSample ?? '',
        technicalSummary: buildAiSummary(pagespeed, geoData),
      });
      result.aiInsights = ai;
    } catch (err) {
      logger.warn({ err }, 'AI analysis failed; returning audit without aiInsights');
    }
  }

  // _htmlSample é apenas um carrier interno; remove antes de devolver
  delete (geoData as any)._htmlSample;
  return result;
}

// ---------- GEO check ----------

interface GeoData extends GeoCheck {
  /** Raw HTML da home — usado pela camada de IA. Não persistido. */
  _htmlSample?: string;
}

async function runGeoCheck(baseUrl: string): Promise<GeoData> {
  const [home, robots, llms, feed] = await Promise.all([
    fetchTimed(baseUrl),
    fetchTimed(`${baseUrl}/robots.txt`),
    fetchTimed(`${baseUrl}/llms.txt`),
    fetchFirstAvailable([
      `${baseUrl}/feed.xml`,
      `${baseUrl}/rss.xml`,
      `${baseUrl}/atom.xml`,
      `${baseUrl}/feed`,
    ]),
  ]);

  const html = home.text ?? '';
  const jsonLdMatches = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>/gi) ?? [];
  const hasJsonLd = jsonLdMatches.length > 0;
  const jsonLdCount = jsonLdMatches.length;
  const hasLlmsTxt = llms.ok;
  const hasRssFeed = feed.ok;
  const botsAllowed = robots.ok ? aiBotsAllowed(robots.text ?? '') : true;

  let score = 0;
  if (hasJsonLd) score += 35;
  if (hasLlmsTxt) score += 25;
  if (hasRssFeed) score += 15;
  if (botsAllowed) score += 25;

  return {
    hasJsonLd,
    jsonLdCount,
    hasLlmsTxt,
    hasRssFeed,
    botsAllowed,
    score: Math.max(0, Math.min(100, Math.round(score))),
    _htmlSample: html.slice(0, 6000),
  };
}

function aiBotsAllowed(robots: string): boolean {
  const lines = robots.split(/\r?\n/);
  let currentAgent = '';
  let allowedSomewhere = false;
  let disallowedSomewhere = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const [k, ...rest] = line.split(':');
    const value = rest.join(':').trim();
    const key = k?.trim().toLowerCase();
    if (key === 'user-agent') {
      currentAgent = value;
    } else if (AI_BOTS.some((b) => b.toLowerCase() === currentAgent.toLowerCase())) {
      if (key === 'allow') allowedSomewhere = true;
      if (key === 'disallow' && value && value !== '#') disallowedSomewhere = true;
    }
  }
  if (allowedSomewhere && !disallowedSomewhere) return true;
  if (!disallowedSomewhere) return true; // default open
  return false;
}

// ---------- fetch helpers ----------

interface TimedFetch {
  ok: boolean;
  statusCode: number | null;
  loadTimeMs: number;
  text: string | null;
}

async function fetchTimed(url: string): Promise<TimedFetch> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  const start = Date.now();
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'user-agent': 'FernandolimaindieAudit/1.0 (+https://github.com/fernandolimaindie)' },
      redirect: 'follow',
    });
    const text = await res.text().catch(() => '');
    return { ok: res.ok, statusCode: res.status, loadTimeMs: Date.now() - start, text };
  } catch {
    return { ok: false, statusCode: null, loadTimeMs: Date.now() - start, text: null };
  } finally {
    clearTimeout(t);
  }
}

async function fetchFirstAvailable(urls: string[]): Promise<TimedFetch> {
  for (const u of urls) {
    const r = await fetchTimed(u);
    if (r.ok) return r;
  }
  return { ok: false, statusCode: null, loadTimeMs: 0, text: null };
}

// ---------- reachability ----------

function isReachable(ps: PagespeedReport | null, geo: GeoData): boolean {
  if (geo._htmlSample && geo._htmlSample.length > 0) return true;
  if (ps?.mobile?.scores.performance !== null && ps?.mobile?.scores.performance !== undefined) return true;
  if (ps?.desktop?.scores.performance !== null && ps?.desktop?.scores.performance !== undefined) return true;
  return false;
}

// ---------- recommendations agregadas ----------

function buildRecommendations(
  ps: PagespeedReport | null,
  geo: GeoData,
): AuditMetrics['recommendations'] {
  const out: AuditMetrics['recommendations'] = [];
  const push = (
    severity: 'high' | 'medium' | 'low',
    area: 'performance' | 'accessibility' | 'best-practices' | 'seo' | 'geo',
    message: string,
  ) => out.push({ severity, area, message });

  // PSI: se totalmente ausente
  if (!ps || (ps.mobile === null && ps.desktop === null)) {
    push(
      'medium',
      'performance',
      'PageSpeed Insights não retornou dados — verifique se o site é público e indexável.',
    );
  }

  // PSI: scores baixos por estratégia
  if (ps?.mobile) addStrategyRecs(ps.mobile, 'mobile', push);
  if (ps?.desktop) addStrategyRecs(ps.desktop, 'desktop', push);

  // GEO
  if (!geo.hasJsonLd) {
    push('high', 'geo', 'Sem JSON-LD na home. LLMs e Google priorizam conteúdo estruturado.');
  } else if (geo.jsonLdCount < 2) {
    push(
      'low',
      'geo',
      'Poucos blocos JSON-LD na home — considere adicionar BreadcrumbList, Article, FAQ etc.',
    );
  }
  if (!geo.hasLlmsTxt) {
    push('medium', 'geo', 'Sem /llms.txt. É o vetor mais direto para citação por LLMs hoje.');
  }
  if (!geo.hasRssFeed) {
    push('low', 'geo', 'Sem feed RSS/Atom. Reduz descoberta por agregadores e LLMs.');
  }
  if (!geo.botsAllowed) {
    push(
      'high',
      'geo',
      'robots.txt bloqueia bots de IA (GPTBot/ClaudeBot/etc). Sem isso, o site não é citado.',
    );
  }

  const sevOrder = { high: 0, medium: 1, low: 2 } as const;
  return out.sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);
}

function addStrategyRecs(
  s: LighthouseStrategy,
  strategy: 'mobile' | 'desktop',
  push: (
    severity: 'high' | 'medium' | 'low',
    area: 'performance' | 'accessibility' | 'best-practices' | 'seo' | 'geo',
    message: string,
  ) => void,
) {
  const scores = s.scores;
  if (scores.performance !== null && scores.performance < 50) {
    push('high', 'performance', `Performance ${strategy} crítica: ${scores.performance}/100.`);
  } else if (scores.performance !== null && scores.performance < 80) {
    push('medium', 'performance', `Performance ${strategy} abaixo do ideal: ${scores.performance}/100.`);
  }
  if (scores.accessibility !== null && scores.accessibility < 80) {
    push(
      scores.accessibility < 50 ? 'high' : 'medium',
      'accessibility',
      `Acessibilidade ${strategy}: ${scores.accessibility}/100. Veja "top issues".`,
    );
  }
  if (scores.bestPractices !== null && scores.bestPractices < 80) {
    push(
      'medium',
      'best-practices',
      `Best Practices ${strategy}: ${scores.bestPractices}/100.`,
    );
  }
  if (scores.seo !== null && scores.seo < 90) {
    push(
      scores.seo < 70 ? 'high' : 'medium',
      'seo',
      `SEO ${strategy}: ${scores.seo}/100.`,
    );
  }

  // Web Vitals — só comenta sobre mobile (mais relevante pra ranqueamento)
  if (strategy === 'mobile') {
    if (s.metrics.lcp !== null && s.metrics.lcp > 2500) {
      push('high', 'performance', `LCP ${s.metrics.lcp}ms — deveria ser ≤2500ms.`);
    }
    if (s.metrics.cls !== null && s.metrics.cls > 0.1) {
      push('medium', 'performance', `CLS ${s.metrics.cls.toFixed(2)} — deveria ser ≤0.1.`);
    }
  }
}

// ---------- AI summary ----------

function buildAiSummary(ps: PagespeedReport | null, geo: GeoData) {
  const m = ps?.mobile;
  return {
    performance: {
      score: m?.scores.performance ?? 0,
      loadTimeMs: m?.metrics.ttfb ?? 0,
      htmlSizeKb: 0,
    },
    seo: {
      score: m?.scores.seo ?? 0,
      hasTitle: true,
      titleLength: 0,
      hasMetaDescription: true,
      hasCanonical: true,
      hasOpenGraph: true,
      hasH1: true,
    },
    geo: {
      score: geo.score,
      jsonLdCount: geo.jsonLdCount,
      hasLlmsTxt: geo.hasLlmsTxt,
      hasRssFeed: geo.hasRssFeed,
      botsAllowed: geo.botsAllowed,
    },
    discovery: { hasRobotsTxt: true, hasSitemap: true },
  };
}
