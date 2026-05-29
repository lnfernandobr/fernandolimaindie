import { Schema, model } from 'mongoose';
import {
  SIGNAL_KINDS,
  SIGNAL_STATUSES,
  INTENT_KEYS,
  DEFAULT_LANG,
} from '../../constants/soulsignal.js';

const SIGNAL_COLLECTION = 'Signal';

const chunkSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    html: { type: String, required: true },
  },
  { _id: false },
);

const faqSchema = new Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const signalSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    kind: { type: String, required: true, enum: SIGNAL_KINDS, index: true },
    intent: { type: String, required: true, enum: INTENT_KEYS, index: true },
    topicSlug: { type: String, required: true, trim: true, index: true },
    entitySlugs: { type: [String], default: [], index: true },
    title: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    bodyHtml: { type: String, required: true },
    chunks: { type: [chunkSchema], default: [] },
    faq: { type: [faqSchema], default: [] },
    relatedIntents: { type: [String], default: [] },
    audioUrl: { type: String, default: null },
    imageUrl: { type: String, default: null },
    lang: { type: String, default: DEFAULT_LANG, trim: true },
    status: { type: String, enum: SIGNAL_STATUSES, default: 'published', index: true },
    publishedAt: { type: Date, default: () => new Date(), index: true },
  },
  { timestamps: true },
);

signalSchema.index({ intent: 1, status: 1, publishedAt: -1 });
signalSchema.index({ topicSlug: 1, status: 1 });

export const SignalModel = model(SIGNAL_COLLECTION, signalSchema);
