import { z } from 'zod';
import { slugSchema } from './common';

// "HH:MM" 24h
export const timeOfDaySchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato esperado HH:MM (24h)');

export const publishFrequencySchema = z.enum(['daily', 'weekly', 'custom']);
export type PublishFrequency = z.infer<typeof publishFrequencySchema>;

export const weekdaySchema = z.number().int().min(0).max(6);

export const channelSocialsSchema = z.object({
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  youtube: z.string().optional(),
  facebook: z.string().optional(),
  email: z.string().email().optional(),
});

// Velocidade média de leitura em pt-BR. Usada para converter "minutos de leitura"
// em "alvo de palavras" no outline da IA.
export const READING_WPM = 200;
export const READING_TIME_PRESETS = [3, 5, 8, 10, 15, 20] as const;
export const READING_TIME_MIN = 2;
export const READING_TIME_MAX = 30;

export function minutesToWordTarget(minutes: number): number {
  return Math.max(1, Math.round(minutes * READING_WPM));
}

export function wordsToReadingTime(words: number): number {
  return Math.max(1, Math.round(words / READING_WPM));
}

/**
 * Bucket do plano de geração de um canal: "N posts de até X minutos de leitura".
 * Permite mix granular (ex: 4 de 8min + 1 de 15min por slot).
 */
export const postPlanItemSchema = z.object({
  count: z.number().int().min(1).max(20),
  targetReadingMinutes: z.number().int().min(READING_TIME_MIN).max(READING_TIME_MAX),
});
export type PostPlanItem = z.infer<typeof postPlanItemSchema>;

export const DEFAULT_POSTS_PLAN: PostPlanItem[] = [{ count: 1, targetReadingMinutes: 8 }];

/** Total de posts por slot (soma dos buckets). */
export function postsPlanTotal(plan: PostPlanItem[]): number {
  return plan.reduce((sum, b) => sum + b.count, 0);
}

/**
 * Canal = um site externo que consome conteúdo gerado por essa API.
 * Mantemos só o essencial: identidade, agenda, ativo.
 */
export const channelInputSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1).max(120),
  niche: z.string().min(1).max(80),
  siteUrl: z.string().url(),
  language: z.string().default('pt-BR'),
  timezone: z.string().default('America/Sao_Paulo'),
  active: z.boolean().default(true),

  publishFrequency: publishFrequencySchema.default('daily'),
  publishTimes: z.array(timeOfDaySchema).default(['09:00']),
  postsPlan: z
    .array(postPlanItemSchema)
    .min(1, 'Defina ao menos um bucket no plano de geração')
    .max(10)
    .default(DEFAULT_POSTS_PLAN),
  publishWeekdays: z.array(weekdaySchema).default([0, 1, 2, 3, 4, 5, 6]),

  notes: z.string().max(2000).optional(),
});

export type ChannelInput = z.infer<typeof channelInputSchema>;

// ---------- Audit ----------

/**
 * Métricas Lighthouse para uma estratégia (mobile ou desktop).
 * Vêm do Google PageSpeed Insights API — Lighthouse oficial.
 */
export const lighthouseStrategySchema = z.object({
  scores: z.object({
    performance: z.number().nullable(),
    accessibility: z.number().nullable(),
    bestPractices: z.number().nullable(),
    seo: z.number().nullable(),
  }),
  metrics: z.object({
    lcp: z.number().nullable(), // Largest Contentful Paint (ms)
    cls: z.number().nullable(), // Cumulative Layout Shift (unitless)
    inp: z.number().nullable(), // Interaction to Next Paint (ms — só com CrUX)
    fcp: z.number().nullable(), // First Contentful Paint (ms)
    ttfb: z.number().nullable(), // Time to First Byte (ms)
    tbt: z.number().nullable(), // Total Blocking Time (ms)
    si: z.number().nullable(), // Speed Index (ms)
  }),
  topIssues: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      displayValue: z.string().optional(),
      score: z.number().nullable(),
      category: z.string(), // performance | accessibility | best-practices | seo
    }),
  ),
});

export type LighthouseStrategy = z.infer<typeof lighthouseStrategySchema>;

export const pagespeedSchema = z.object({
  fetchedAt: z.string(),
  mobile: lighthouseStrategySchema.nullable(),
  desktop: lighthouseStrategySchema.nullable(),
  error: z.string().optional(),
});

export type PagespeedReport = z.infer<typeof pagespeedSchema>;

/**
 * GEO check (sinal próprio nosso — Lighthouse não cobre).
 * Foca no que ajuda LLMs a citar o site:
 * - JSON-LD presente
 * - llms.txt presente
 * - feed RSS/Atom presente
 * - robots permite bots de IA (GPTBot, ClaudeBot, PerplexityBot)
 */
export const geoCheckSchema = z.object({
  hasJsonLd: z.boolean(),
  jsonLdCount: z.number(),
  hasLlmsTxt: z.boolean(),
  hasRssFeed: z.boolean(),
  botsAllowed: z.boolean(),
  score: z.number().min(0).max(100),
});

export type GeoCheck = z.infer<typeof geoCheckSchema>;

export const auditMetricsSchema = z.object({
  fetchedAt: z.string(),
  reachable: z.boolean(),

  pagespeed: pagespeedSchema.nullable(),
  geo: geoCheckSchema,

  visits: z.object({
    tracked: z.boolean(),
    message: z.string(),
  }),

  recommendations: z.array(
    z.object({
      severity: z.enum(['high', 'medium', 'low']),
      area: z.enum(['performance', 'accessibility', 'best-practices', 'seo', 'geo']),
      message: z.string(),
    }),
  ),

  aiInsights: z
    .object({
      generatedAt: z.string(),
      provider: z.string(),
      insights: z.array(
        z.object({
          severity: z.enum(['high', 'medium', 'low']),
          area: z.enum(['content', 'structure', 'authority', 'opportunity']),
          title: z.string(),
          detail: z.string(),
        }),
      ),
    })
    .optional(),
});

export type AuditMetrics = z.infer<typeof auditMetricsSchema>;

export const channelDtoSchema = channelInputSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastAudit: auditMetricsSchema.optional(),
});

export type ChannelDto = z.infer<typeof channelDtoSchema>;

export function publishTimesToCron(times: string[], weekdays: number[]): string[] {
  const days = weekdays.length > 0 ? weekdays : [0, 1, 2, 3, 4, 5, 6];
  const isEveryDay = days.length === 7;
  const dayPart = isEveryDay ? '*' : [...days].sort().join(',');
  return times.map((t) => {
    const [h = '0', m = '0'] = t.split(':');
    return `${Number(m)} ${Number(h)} * * ${dayPart}`;
  });
}
