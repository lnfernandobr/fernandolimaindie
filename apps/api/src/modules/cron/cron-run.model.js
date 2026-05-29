import mongoose from 'mongoose';
import { CRON_JOB_NAMES, CRON_TRIGGERS } from '../../constants/cron.js';

const cronRunSchema = new mongoose.Schema(
  {
    jobName: { type: String, enum: Object.values(CRON_JOB_NAMES), required: true },
    triggeredBy: { type: String, enum: CRON_TRIGGERS, required: true },
    ranAt: { type: Date, required: true },
    durationMs: { type: Number, required: true },
    created: { type: Number, default: 0 },
    regenerated: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    totalProcessed: { type: Number, default: 0 },
  },
  { timestamps: false },
);

cronRunSchema.index({ jobName: 1, ranAt: -1 });

export const CronRunModel = mongoose.model('CronRun', cronRunSchema);
