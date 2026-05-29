import { CronRunModel } from './cron-run.model.js';
import { CRON_DEFAULTS } from '../../constants/cron.js';

export const saveRun = (run) => CronRunModel.create(run);

export const listRecentRuns = (jobName, limit = CRON_DEFAULTS.RUN_HISTORY_LIMIT) =>
  CronRunModel.find({ jobName }).sort({ ranAt: -1 }).limit(limit).lean();
