import { Schema, model } from 'mongoose';

const GENERATION_CONFIG_COLLECTION = 'GenerationConfig';

// Config operacional do cron, editável em runtime (pelo admin) — não fica no env.
const generationConfigSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'generation' },
    dailyLimit: { type: Number, required: true, min: 1, max: 50, default: 2 },
  },
  { timestamps: true },
);

export const GenerationConfigModel = model(GENERATION_CONFIG_COLLECTION, generationConfigSchema);
