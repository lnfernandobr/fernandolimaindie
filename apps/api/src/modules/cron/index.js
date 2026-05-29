import cron from 'node-cron';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { CRON_JOB_NAMES } from '../../constants/cron.js';
import { runGenerationJob } from './generation.job.js';

export const startCronJobs = () => {
  if (!env.CRON_ENABLED) {
    logger.info('cron jobs disabled');
    return;
  }

  cron.schedule(env.CRON_GENERATION_SCHEDULE, () => {
    void runGenerationJob();
  });

  logger.info(
    { schedule: env.CRON_GENERATION_SCHEDULE, jobs: Object.values(CRON_JOB_NAMES) },
    'cron jobs registered',
  );
};

export { runGenerationJob };
