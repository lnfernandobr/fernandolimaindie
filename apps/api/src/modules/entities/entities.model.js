import { Schema, model } from 'mongoose';
import { ENTITY_KINDS, DEFAULT_LANG } from '../../constants/content.js';

const ENTITY_COLLECTION = 'Entity';

const entitySchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    name: { type: String, required: true, trim: true },
    kind: { type: String, required: true, enum: ENTITY_KINDS, index: true },
    description: { type: String, required: true, trim: true },
    synonyms: { type: [String], default: [] },
    imageUrl: { type: String, default: null },
    lang: { type: String, default: DEFAULT_LANG, trim: true },
  },
  { timestamps: true },
);

export const EntityModel = model(ENTITY_COLLECTION, entitySchema);
