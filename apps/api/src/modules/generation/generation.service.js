import { env } from '../../config/env.js';
import {
  GENERATION_DEFAULTS,
  GENERATION_OUTCOMES,
  GENERATION_ERRORS,
} from '../../constants/generation.js';
import { CRON_DEFAULTS, CRON_JOB_NAMES } from '../../constants/cron.js';
import { DEFAULT_LANG } from '../../constants/soulsignal.js';
import { badRequest } from '../../errors/factories.js';
import {
  findSignalBySlugAnyStatus,
  createSignal as insertSignal,
  updateSignalBySlug as patchSignalBySlug,
} from '../signals/signals.repository.js';
import { listRecentRuns } from '../cron/cron-run.repository.js';
import { completeStructured } from './generation.openai.js';
import { buildPrompt } from './generation.prompts.js';
import {
  generatedContentSchema,
  generatedContentJsonSchema,
} from './generation.schema.js';
import { buildMockContent } from './generation.mock.js';
import { findSeedBySlug, loadAllSeeds, loadSeedsByKind } from './generation.seeds.js';

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
  chunks: content.chunks,
  faq: content.faq,
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
    jsonSchema: generatedContentJsonSchema,
    model,
  });
  const parsed = generatedContentSchema.safeParse(raw);
  if (!parsed.success) throw badRequest(GENERATION_ERRORS.OPENAI_INVALID_OUTPUT, parsed.error.flatten());
  return parsed.data;
};

export const runSeed = async ({ seed, model, force }) => {
  const existing = await findSignalBySlugAnyStatus(seed.seedSlug);
  if (existing?.status === GENERATION_DEFAULTS.STATUS_PUBLISHED && !force) {
    return {
      seedSlug: seed.seedSlug,
      outcome: GENERATION_OUTCOMES.SKIPPED_PUBLISHED,
      signalSlug: existing.slug,
    };
  }
  const content = await generateContent(seed, model);
  const input = buildSignalInput(seed, content);
  if (existing) {
    const updated = await patchSignalBySlug(seed.seedSlug, input);
    return {
      seedSlug: seed.seedSlug,
      outcome: GENERATION_OUTCOMES.REGENERATED_DRAFT,
      signalSlug: updated.slug,
    };
  }
  const created = await insertSignal(input);
  return {
    seedSlug: seed.seedSlug,
    outcome: GENERATION_OUTCOMES.CREATED,
    signalSlug: created.slug,
  };
};

export const generateOne = async ({ seedSlug, model, force }) => {
  const seed = await findSeedBySlug(seedSlug);
  return runSeed({ seed, model, force });
};

const pickPendingSeeds = async ({ seedKind, limit, force }) => {
  const candidates = seedKind ? await loadSeedsByKind(seedKind) : await loadAllSeeds();
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
        error: err?.message ?? GENERATION_ERRORS.OPENAI_CALL_FAILED,
      });
    }
  }
  return { processed: results.length, results };
};

export const countPendingSeeds = async () => {
  const candidates = await loadAllSeeds();
  const checks = await Promise.all(
    candidates.map(async (seed) => {
      const existing = await findSignalBySlugAnyStatus(seed.seedSlug);
      return existing?.status === GENERATION_DEFAULTS.STATUS_PUBLISHED ? null : seed;
    }),
  );
  return checks.filter(Boolean).length;
};

export const getGenerationStatus = async () => {
  const [runs, pendingSeeds] = await Promise.all([
    listRecentRuns(CRON_JOB_NAMES.GENERATION, CRON_DEFAULTS.RUN_HISTORY_LIMIT),
    countPendingSeeds(),
  ]);
  return {
    enabled: env.CRON_ENABLED,
    schedule: env.CRON_GENERATION_SCHEDULE,
    dailyLimit: env.CRON_GENERATION_DAILY_LIMIT,
    pendingSeeds,
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
