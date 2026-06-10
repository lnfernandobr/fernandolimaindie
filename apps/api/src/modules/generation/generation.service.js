import { env } from '../../config/env.js';
import {
  GENERATION_DEFAULTS,
  GENERATION_OUTCOMES,
  GENERATION_ERRORS,
  SEED_RUN_STATUS,
  QUOTA_KIND_ORDER,
} from '../../constants/generation.js';
import { CRON_DEFAULTS, CRON_JOB_NAMES } from '../../constants/cron.js';
import { DEFAULT_LANG } from '../../constants/content.js';
import { badRequest } from '../../errors/factories.js';
import { logger } from '../../config/logger.js';
import {
  findSignalBySlugAnyStatus,
  createSignal as insertSignal,
  updateSignalBySlug as patchSignalBySlug,
} from '../signals/signals.repository.js';
import { listRecentRuns } from '../cron/cron-run.repository.js';
import { completeStructured } from './generation.anthropic.js';
import { buildPrompt } from './generation.prompts.js';
import {
  generatedContentSchema,
  buildContentJsonSchema,
} from './generation.schema.js';
import { stripDashes, stripDashesIn } from '../../lib/strip-dashes.js';
import { buildMockContent } from './generation.mock.js';
import { findSeedBySlug, loadAllSeeds, loadSeedsByKind } from './generation.seeds.js';
import { appendRunLogEntry, updateSeedBySlug } from './generation.seed.repository.js';
import { getGenerationConfig } from './generation.config.js';

const LOG_MESSAGE_LIMIT = 240;
const LAST_ERROR_LIMIT = 500;

const truncate = (s, n) => {
  if (!s) return '';
  const str = String(s);
  return str.length > n ? str.slice(0, n) : str;
};

const persistLogEntry = async (seedSlug, entry) => {
  try {
    await appendRunLogEntry(seedSlug, entry);
  } catch (err) {
    logger.warn({ err: err.message, seedSlug }, 'failed to persist seed run log entry');
  }
};

const trackStep = (seedSlug) => async (step, label, fn) => {
  const startedAt = new Date();
  const start = Date.now();
  try {
    const result = await fn();
    await persistLogEntry(seedSlug, {
      step,
      label,
      status: 'ok',
      durationMs: Date.now() - start,
      message: '',
      at: startedAt,
    });
    return result;
  } catch (err) {
    await persistLogEntry(seedSlug, {
      step,
      label,
      status: 'error',
      durationMs: Date.now() - start,
      message: truncate(err?.message ?? 'unknown', LOG_MESSAGE_LIMIT),
      at: startedAt,
    });
    throw err;
  }
};

const beginRun = (seedSlug) =>
  updateSeedBySlug(seedSlug, {
    runStatus: SEED_RUN_STATUS.GENERATING,
    runStartedAt: new Date(),
    runFinishedAt: null,
    runDurationMs: 0,
    runLog: [],
    lastError: '',
  });

const finishRunOk = (seedSlug, startMs, lastSignalSlug) =>
  updateSeedBySlug(seedSlug, {
    runStatus: SEED_RUN_STATUS.DONE,
    runFinishedAt: new Date(),
    runDurationMs: Date.now() - startMs,
    lastSignalSlug: lastSignalSlug ?? '',
  });

const finishRunError = (seedSlug, startMs, err) =>
  updateSeedBySlug(seedSlug, {
    runStatus: SEED_RUN_STATUS.ERROR,
    runFinishedAt: new Date(),
    runDurationMs: Date.now() - startMs,
    lastError: truncate(err?.message ?? 'unknown', LAST_ERROR_LIMIT),
  });

const buildSignalInput = (seed, content) => ({
  slug: seed.seedSlug,
  kind: seed.signalKind,
  intent: seed.intent,
  topicSlug: seed.topicSlug,
  entitySlugs: seed.entitySlugs,
  title: content.title,
  answer: content.answer,
  summary: content.summary,
  bodyHtml: content.bodyHtml,
  imagePrompt: content.imagePrompt,
  chunks: content.chunks,
  faq: content.faq,
  verses: content.verses ?? [],
  category: content.category ?? seed.subject?.category ?? null,
  relatedIntents: content.relatedIntents.filter((k) => k !== seed.intent),
  lang: DEFAULT_LANG,
  status: GENERATION_DEFAULTS.STATUS_PUBLISHED,
  publishedAt: new Date(),
});

const generateContent = async (seed, model) => {
  if (env.OPENAI_MOCK_MODE) return buildMockContent(seed);
  const { system, user } = buildPrompt(seed);
  const raw = await completeStructured({
    system,
    user,
    jsonSchema: buildContentJsonSchema(seed.signalKind),
    model,
  });
  const parsed = generatedContentSchema.safeParse(raw);
  if (!parsed.success) throw badRequest(GENERATION_ERRORS.ANTHROPIC_INVALID_OUTPUT, parsed.error.flatten());
  return sanitizeContent(parsed.data);
};

// Rede de segurança: o prompt já proíbe travessão, mas se o modelo escapar a regra
// o texto é corrigido aqui. Versículos ficam intactos (não se altera citação bíblica).
const sanitizeContent = (content) => ({
  ...stripDashesIn(content, ['title', 'answer', 'summary', 'bodyHtml']),
  chunks: content.chunks.map((c) => ({ ...c, html: stripDashes(c.html) })),
  faq: content.faq.map((f) => stripDashesIn(f, ['question', 'answer'])),
});

const executeRun = async ({ seed, model, force, startMs }) => {
  const track = trackStep(seed.seedSlug);
  try {
    const existing = await track('check', 'Verifica signal existente', () =>
      findSignalBySlugAnyStatus(seed.seedSlug),
    );
    if (existing?.status === GENERATION_DEFAULTS.STATUS_PUBLISHED && !force) {
      await finishRunOk(seed.seedSlug, startMs, existing.slug);
      return {
        seedSlug: seed.seedSlug,
        outcome: GENERATION_OUTCOMES.SKIPPED_PUBLISHED,
        signalSlug: existing.slug,
      };
    }
    const content = await track(
      'llm',
      `Conteúdo (${model ?? env.ANTHROPIC_MODEL})`,
      () => generateContent(seed, model),
    );
    const input = buildSignalInput(seed, content);
    const result = await track(
      'save',
      existing ? 'Atualiza signal' : 'Cria signal',
      async () => {
        if (existing) {
          const updated = await patchSignalBySlug(seed.seedSlug, input);
          return { outcome: GENERATION_OUTCOMES.REGENERATED_DRAFT, slug: updated.slug };
        }
        const created = await insertSignal(input);
        return { outcome: GENERATION_OUTCOMES.CREATED, slug: created.slug };
      },
    );
    await finishRunOk(seed.seedSlug, startMs, result.slug);
    return { seedSlug: seed.seedSlug, outcome: result.outcome, signalSlug: result.slug };
  } catch (err) {
    await finishRunError(seed.seedSlug, startMs, err);
    throw err;
  }
};

export const runSeed = async ({ seed, model, force }) => {
  await beginRun(seed.seedSlug);
  return executeRun({ seed, model, force, startMs: Date.now() });
};

export const generateOne = async ({ seedSlug, model, force }) => {
  const seed = await findSeedBySlug(seedSlug);
  return runSeed({ seed, model, force });
};

export const startSeedRun = async ({ seedSlug, force }) => {
  const seed = await findSeedBySlug(seedSlug);
  await beginRun(seedSlug);
  const startMs = Date.now();
  executeRun({ seed, force, startMs }).catch((err) => {
    logger.error({ err: err.message, seedSlug }, 'background seed run failed');
  });
  return { seedSlug, runStatus: SEED_RUN_STATUS.GENERATING };
};

const byPriority = (a, b) => (a.priority ?? 3) - (b.priority ?? 3);

const pickPendingSeeds = async ({ seedKind, limit, force }) => {
  const loaded = seedKind ? await loadSeedsByKind(seedKind) : await loadAllSeeds();
  const candidates = loaded.slice().sort(byPriority);
  if (force) return candidates.slice(0, limit);
  const checks = await Promise.all(
    candidates.map(async (seed) => {
      const existing = await findSignalBySlugAnyStatus(seed.seedSlug);
      return existing?.status === GENERATION_DEFAULTS.STATUS_PUBLISHED ? null : seed;
    }),
  );
  return checks.filter(Boolean).slice(0, limit);
};

export const generateBatch = async ({ seedKind, limit, model, force }) => {
  const pending = await pickPendingSeeds({ seedKind, limit, force });
  const results = [];
  for (const seed of pending) {
    try {
      const out = await runSeed({ seed, model, force });
      results.push(out);
    } catch (err) {
      results.push({
        seedSlug: seed.seedSlug,
        outcome: GENERATION_OUTCOMES.FAILED,
        error: err?.message ?? GENERATION_ERRORS.ANTHROPIC_CALL_FAILED,
      });
    }
  }
  return { processed: results.length, results };
};

// Seeds ativos que ainda não viraram signal publicado (o que o cron processaria).
const listPendingSeeds = async () => {
  const candidates = await loadAllSeeds();
  const checks = await Promise.all(
    candidates.map(async (seed) => {
      const existing = await findSignalBySlugAnyStatus(seed.seedSlug);
      return existing?.status === GENERATION_DEFAULTS.STATUS_PUBLISHED ? null : seed;
    }),
  );
  return checks.filter(Boolean);
};

export const countPendingSeeds = async () => (await listPendingSeeds()).length;

const countPendingByKind = (pending) => {
  const out = Object.fromEntries(QUOTA_KIND_ORDER.map((k) => [k, 0]));
  for (const seed of pending) {
    if (out[seed.seedKind] !== undefined) out[seed.seedKind] += 1;
  }
  return out;
};

export const getGenerationStatus = async () => {
  const [runs, pending, config] = await Promise.all([
    listRecentRuns(CRON_JOB_NAMES.GENERATION, CRON_DEFAULTS.RUN_HISTORY_LIMIT),
    listPendingSeeds(),
    getGenerationConfig(),
  ]);
  return {
    enabled: env.CRON_ENABLED,
    schedule: env.CRON_GENERATION_SCHEDULE,
    dailyQuotas: config.dailyQuotas,
    pendingSeeds: pending.length,
    pendingByKind: countPendingByKind(pending),
    recentRuns: runs.map((r) => ({
      triggeredBy: r.triggeredBy,
      ranAt: r.ranAt,
      durationMs: r.durationMs,
      created: r.created,
      regenerated: r.regenerated,
      skipped: r.skipped,
      failed: r.failed,
      totalProcessed: r.totalProcessed,
    })),
  };
};
