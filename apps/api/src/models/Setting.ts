import { Schema, model, type InferSchemaType, type Model } from 'mongoose';

/**
 * Singleton — sempre lemos via Setting.findOne({ key: 'global' }) ou findOneAndUpdate
 * com upsert. Não há _id natural; o discriminador é o campo `key` indexado único.
 */
const settingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true, default: 'global' },
    aiProvider: { type: String, enum: ['mock', 'claude', 'openai'], default: 'mock' },
    aiModel: { type: String, default: null },
    imageProvider: { type: String, enum: ['mock', 'openai'], default: 'mock' },
    imageModel: { type: String, default: null },
  },
  { timestamps: true },
);

export type SettingDoc = InferSchemaType<typeof settingSchema>;

export const Setting: Model<SettingDoc> = model<SettingDoc>('Setting', settingSchema);

export const SETTINGS_KEY = 'global';
