import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { CRON_DEFAULTS, CRON_JOB_NAMES } from '../../constants/cron.js';
import { GENERATION_OUTCOMES } from '../../constants/generation.js';
import { generateBatch } from '../generation/generation.service.js';
import { saveRun } from './cron-run.repository.js';
import { triggerRevalidation } from '../../lib/revalidate.js';

const tallyOutcomes = (results) =>
  results.reduce(
    (acc, r) => {
      if (r.outcome === GENERATION_OUTCOMES.CREATED) acc.created++;
      else if (r.outcome === GENERATION_OUTCOMES.REGENERATED_DRAFT) acc.regenerated++;
      else if (r.outcome === GENERATION_OUTCOMES.SKIPPED_PUBLISHED) acc.skipped++;
      else acc.failed++;
      return acc;
    },
    { created: 0, regenerated: 0, skipped: 0, failed: 0 },
  );

export const runGenerationJob = async (triggeredBy = CRON_DEFAULTS.TRIGGER_CRON) => {
  const ranAt = new Date();
  const start = Date.now();
  logger.info({ triggeredBy }, 'generation job started');

  try {
    const { results } = await generateBatch({
      limit: env.CRON_GENERATION_DAILY_LIMIT,
      force: false,
    });

    const counts = tallyOutcomes(results);
    const durationMs = Date.now() - start;

    const run = await saveRun({
      jobName: CRON_JOB_NAMES.GENERATION,
      triggeredBy,
      ranAt,
      durationMs,
      ...counts,
      totalProcessed: results.length,
    });

    logger.info({ ...counts, durationMs, totalProcessed: results.length }, 'generation job done');

    if (counts.created > 0 || counts.regenerated > 0) {
      void triggerRevalidation(['signals']);
    }

    return run;
  } catch (err) {
    const durationMs = Date.now() - start;
    logger.error({ err }, 'generation job failed');
    return saveRun({
      jobName: CRON_JOB_NAMES.GENERATION,
      triggeredBy,
      ranAt,
      durationMs,
      created: 0,
      regenerated: 0,
      skipped: 0,
      failed: 1,
      totalProcessed: 0,
    });
  }
};
