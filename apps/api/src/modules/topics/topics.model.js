import { Schema, model } from 'mongoose';
import { INTENT_KEYS, DEFAULT_LANG } from '../../constants/soulsignal.js';

const TOPIC_COLLECTION = 'Topic';

const topicSchema = new Schema(
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
    intent: { type: String, required: true, enum: INTENT_KEYS, index: true },
    description: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    bodyHtml: { type: String, default: '' },
    relatedTopicSlugs: { type: [String], default: [] },
    heroImageUrl: { type: String, default: null },
    lang: { type: String, default: DEFAULT_LANG, trim: true },
  },
  { timestamps: true },
);

export const TopicModel = model(TOPIC_COLLECTION, topicSchema);
