import { Schema, model } from 'mongoose';
import { INTENT_KEYS } from '../../constants/content.js';
import { SEED_KINDS } from '../../constants/generation.js';

const SEED_COLLECTION = 'Seed';

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
  },
  { timestamps: true },
);

export const SeedModel = model(SEED_COLLECTION, seedSchema);
