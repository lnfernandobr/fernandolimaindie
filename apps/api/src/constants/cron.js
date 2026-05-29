export const CRON_JOB_NAMES = Object.freeze({
  GENERATION: 'generation',
});

export const CRON_DEFAULTS = Object.freeze({
  GENERATION_SCHEDULE: '0 3 * * *',
  GENERATION_DAILY_LIMIT: 5,
  ENABLED: 'false',
  RUN_HISTORY_LIMIT: 10,
  TRIGGER_CRON: 'cron',
  TRIGGER_MANUAL: 'manual',
});

export const CRON_TRIGGERS = Object.freeze([
  CRON_DEFAULTS.TRIGGER_CRON,
  CRON_DEFAULTS.TRIGGER_MANUAL,
]);
