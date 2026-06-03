import { Schema, model } from 'mongoose';
import { INTENT_KEYS } from '../../constants/content.js';
import { SEED_KINDS, SEED_RUN_STATUS, SEED_RUN_STATUSES } from '../../constants/generation.js';

const SEED_COLLECTION = 'Seed';

const runLogEntrySchema = new Schema(
  {
    step: { type: String, required: true },
    label: { type: String, default: '' },
    status: { type: String, enum: ['ok', 'error'], required: true },
    durationMs: { type: Number, default: 0 },
    message: { type: String, default: '' },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

// Fila do cron, no banco (editável pelo admin). Importada dos JSON no boot.
const seedSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    seedKind: { type: String, required: true, enum: SEED_KINDS, index: true },
    signalKind: { type: String, required: true },
    intent: { type: String, required: true, enum: INTENT_KEYS, index: true },
    topicSlug: { type: String, required: true, trim: true },
    entitySlugs: { type: [String], default: [] },
    priority: { type: Number, default: 3, index: true },
    status: { type: String, enum: ['active', 'skipped'], default: 'active', index: true },
    subject: { type: Schema.Types.Mixed, default: {} },
    runStatus: { type: String, enum: SEED_RUN_STATUSES, default: SEED_RUN_STATUS.IDLE, index: true },
    runLog: { type: [runLogEntrySchema], default: [] },
    runStartedAt: { type: Date, default: null },
    runFinishedAt: { type: Date, default: null },
    runDurationMs: { type: Number, default: 0 },
    lastError: { type: String, default: '' },
    lastSignalSlug: { type: String, default: '' },
  },
  { timestamps: true },
);

export const SeedModel = model(SEED_COLLECTION, seedSchema);
