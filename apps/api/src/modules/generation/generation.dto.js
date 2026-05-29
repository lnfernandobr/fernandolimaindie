export const toRunReport = (result) => ({
  seedSlug: result.seedSlug,
  outcome: result.outcome,
  signalSlug: result.signalSlug ?? null,
  error: result.error ?? null,
});

export const toBatchReport = ({ processed, results }) => ({
  processed,
  results: results.map(toRunReport),
});

export const toJobRunReport = (run) => ({
  jobName: run.jobName,
  triggeredBy: run.triggeredBy,
  ranAt: run.ranAt,
  durationMs: run.durationMs,
  created: run.created,
  regenerated: run.regenerated,
  skipped: run.skipped,
  failed: run.failed,
  totalProcessed: run.totalProcessed,
});
