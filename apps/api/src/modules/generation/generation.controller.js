import { HTTP_STATUS } from '../../constants/http.js';
import { CRON_DEFAULTS } from '../../constants/cron.js';
import { runOneSchema, runBatchSchema } from './generation.schema.js';
import { generateOne, generateBatch, getGenerationStatus } from './generation.service.js';
import { loadAllSeeds, loadSeedsByKind } from './generation.seeds.js';
import { toRunReport, toBatchReport, toJobRunReport } from './generation.dto.js';
import { runGenerationJob } from '../cron/generation.job.js';

export const handleRunOne = async (req, res) => {
  const input = runOneSchema.parse(req.body);
  const result = await generateOne(input);
  res.status(HTTP_STATUS.OK).json(toRunReport(result));
};

export const handleRunBatch = async (req, res) => {
  const input = runBatchSchema.parse(req.body);
  const result = await generateBatch(input);
  res.status(HTTP_STATUS.OK).json(toBatchReport(result));
};

export const handleListSeeds = async (req, res) => {
  const { kind } = req.query;
  const seeds = kind ? await loadSeedsByKind(kind) : await loadAllSeeds();
  res.status(HTTP_STATUS.OK).json({
    total: seeds.length,
    items: seeds.map((s) => ({
      seedSlug: s.seedSlug,
      seedKind: s.seedKind,
      signalKind: s.signalKind,
      intent: s.intent,
      topicSlug: s.topicSlug,
    })),
  });
};

export const handleGetStatus = async (req, res) => {
  const status = await getGenerationStatus();
  res.status(HTTP_STATUS.OK).json(status);
};

export const handleTriggerJob = async (req, res) => {
  const run = await runGenerationJob(CRON_DEFAULTS.TRIGGER_MANUAL);
  res.status(HTTP_STATUS.OK).json(toJobRunReport(run));
};
