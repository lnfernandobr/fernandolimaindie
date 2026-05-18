import type { LighthouseStrategy, PagespeedReport } from '@fernandolimaindie/shared';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

/**
 * Wrapper do Google PageSpeed Insights API (Lighthouse oficial).
 *
 * - Sem chave: ~1 req/s, sujeito a rate limit do Google.
 * - Com chave (GOOGLE_PAGESPEED_API_KEY no env): 25k req/dia gratuitos.
 *   Pega em https://console.cloud.google.com/apis/credentials — não precisa
 *   habilitar billing.
 *
 * Cada chamada demora 10–30s. Por isso:
 * - audit cacheia o resultado por 1h (config no runner)
 * - mobile + desktop rodam em paralelo
 */

const PSI_URL = 'https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed';
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'] as const;
const STRATEGIES = ['mobile', 'desktop'] as const;
const PSI_TIMEOUT_MS = 90_000; // PSI pode demorar; sites lentos podem extrapolar 60s

export async function runPagespeed(siteUrl: string): Promise<PagespeedReport> {
  const fetchedAt = new Date().toISOString();
  try {
    const [mobile, desktop] = await Promise.all([
      fetchStrategy(siteUrl, 'mobile'),
      fetchStrategy(siteUrl, 'desktop'),
    ]);
    return { fetchedAt, mobile, desktop };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn({ err, siteUrl }, 'pagespeed run failed');
    return { fetchedAt, mobile: null, desktop: null, error: message };
  }
}

async function fetchStrategy(
  siteUrl: string,
  strategy: (typeof STRATEGIES)[number],
): Promise<LighthouseStrategy | null> {
  const params = new URLSearchParams();
  params.set('url', siteUrl);
  params.set('strategy', strategy);
  for (const c of CATEGORIES) params.append('category', c);
  if (env.GOOGLE_PAGESPEED_API_KEY) params.set('key', env.GOOGLE_PAGESPEED_API_KEY);

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), PSI_TIMEOUT_MS);

  try {
    const res = await fetch(`${PSI_URL}?${params.toString()}`, { signal: ctrl.signal });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      logger.warn(
        { status: res.status, strategy, body: body.slice(0, 200) },
        'pagespeed strategy failed',
      );
      return null;
    }
    const data = (await res.json()) as PsiResponse;
    return parseStrategy(data);
  } catch (err) {
    logger.warn({ err, strategy }, 'pagespeed strategy error');
    return null;
  } finally {
    clearTimeout(t);
  }
}

function parseStrategy(data: PsiResponse): LighthouseStrategy {
  const lh = data.lighthouseResult ?? null;
  const cats = lh?.categories ?? {};
  const audits = lh?.audits ?? {};

  const scores = {
    performance: scoreOf(cats['performance']?.score),
    accessibility: scoreOf(cats['accessibility']?.score),
    bestPractices: scoreOf(cats['best-practices']?.score),
    seo: scoreOf(cats['seo']?.score),
  };

  const metrics = {
    lcp: numericOf(audits['largest-contentful-paint']),
    cls: numericOf(audits['cumulative-layout-shift']),
    inp: cruxInp(data),
    fcp: numericOf(audits['first-contentful-paint']),
    ttfb: numericOf(audits['server-response-time']),
    tbt: numericOf(audits['total-blocking-time']),
    si: numericOf(audits['speed-index']),
  };

  const topIssues = pickTopIssues(audits, cats);

  return { scores, metrics, topIssues };
}

function scoreOf(s: number | null | undefined): number | null {
  if (s === null || s === undefined) return null;
  return Math.round(s * 100);
}

function numericOf(audit: PsiAudit | undefined): number | null {
  if (!audit) return null;
  const v = audit.numericValue;
  return typeof v === 'number' ? Math.round(v) : null;
}

/** INP só vem do CrUX (dados de campo) — pode estar ausente em sites com pouco tráfego. */
function cruxInp(data: PsiResponse): number | null {
  const m = data.loadingExperience?.metrics;
  const inp = m?.['INTERACTION_TO_NEXT_PAINT_MS']?.percentile;
  return typeof inp === 'number' ? inp : null;
}

interface AuditCategoryRef {
  id: string;
  weight: number;
}

function pickTopIssues(
  audits: Record<string, PsiAudit>,
  cats: Record<string, PsiCategory>,
): LighthouseStrategy['topIssues'] {
  // Constrói índice audit → categoria (pelo primeiro categoria que cita o audit).
  const auditToCategory = new Map<string, string>();
  for (const [catKey, cat] of Object.entries(cats)) {
    for (const ref of cat.auditRefs ?? []) {
      if (!auditToCategory.has(ref.id)) auditToCategory.set(ref.id, catKey);
    }
  }

  const out: LighthouseStrategy['topIssues'] = [];
  for (const [id, audit] of Object.entries(audits)) {
    if (audit.score === null || audit.score === undefined) continue;
    if (audit.score >= 0.9) continue;
    if (audit.scoreDisplayMode === 'notApplicable' || audit.scoreDisplayMode === 'manual') continue;
    out.push({
      id,
      title: audit.title ?? id,
      displayValue: audit.displayValue,
      score: audit.score,
      category: auditToCategory.get(id) ?? 'performance',
    });
  }
  return out.sort((a, b) => (a.score ?? 1) - (b.score ?? 1)).slice(0, 8);
}

// ---------- tipos do PSI (subset que usamos) ----------

interface PsiAudit {
  id?: string;
  title?: string;
  displayValue?: string;
  score?: number | null;
  numericValue?: number;
  scoreDisplayMode?: string;
}

interface PsiCategory {
  score?: number | null;
  auditRefs?: AuditCategoryRef[];
}

interface PsiResponse {
  lighthouseResult?: {
    categories?: Record<string, PsiCategory>;
    audits?: Record<string, PsiAudit>;
  };
  loadingExperience?: {
    metrics?: Record<string, { percentile?: number }>;
  };
}
