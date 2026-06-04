import { Schema, model } from 'mongoose';
import { DEFAULT_DAILY_QUOTAS, QUOTA_PER_KIND_MAX } from '../../constants/generation.js';

const GENERATION_CONFIG_COLLECTION = 'GenerationConfig';

const quota = (def) => ({ type: Number, required: true, min: 0, max: QUOTA_PER_KIND_MAX, default: def });

// Cota diária de geração por tipo de conteúdo (chaveada por seedKind).
const dailyQuotasSchema = new Schema(
  {
    'verse-collection': quota(DEFAULT_DAILY_QUOTAS['verse-collection']),
    psalm: quota(DEFAULT_DAILY_QUOTAS.psalm),
    prayer: quota(DEFAULT_DAILY_QUOTAS.prayer),
    devotional: quota(DEFAULT_DAILY_QUOTAS.devotional),
    reflection: quota(DEFAULT_DAILY_QUOTAS.reflection),
    article: quota(DEFAULT_DAILY_QUOTAS.article),
  },
  { _id: false },
);

// Config operacional do cron, editável em runtime (pelo admin) — não fica no env.
const generationConfigSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'generation' },
    dailyQuotas: { type: dailyQuotasSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export const GenerationConfigModel = model(GENERATION_CONFIG_COLLECTION, generationConfigSchema);
