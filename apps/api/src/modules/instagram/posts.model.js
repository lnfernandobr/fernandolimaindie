import { Schema, model } from 'mongoose';
import { INSTAGRAM_LIMITS, INSTAGRAM_VIDEO } from '../../constants/instagram.js';

const POST_COLLECTION = 'InstagramPost';

const slideSchema = new Schema(
  {
    index: { type: Number, required: true },
    role: { type: String, default: 'body' },
    text: { type: String, default: '' },
    imageSubject: { type: String, default: '' },
    imageScene: { type: String, default: '' },
    imagePrompt: { type: String, default: '' },
    imageUrl: { type: String, required: true },
  },
  { _id: false },
);

const visualAnchorsSchema = new Schema(
  {
    medium: { type: String, default: '' },
    palette: { type: String, default: '' },
    lighting: { type: String, default: '' },
    lensOrTechnique: { type: String, default: '' },
    composition: { type: String, default: '' },
    texture: { type: String, default: '' },
    reference: { type: String, default: '' },
  },
  { _id: false },
);

const videoVariantSchema = new Schema(
  {
    status: { type: String, default: INSTAGRAM_VIDEO.STATUS.IDLE },
    url: { type: String, default: null },
    durationMs: { type: Number, default: 0 },
    scenes: { type: Number, default: 0 },
    error: { type: String, default: null },
    generatedAt: { type: Date, default: null },
  },
  { _id: false },
);

const videoSchema = new Schema(
  {
    short: { type: videoVariantSchema, default: () => ({ status: INSTAGRAM_VIDEO.STATUS.IDLE }) },
    long: { type: videoVariantSchema, default: () => ({ status: INSTAGRAM_VIDEO.STATUS.IDLE }) },
  },
  { _id: false },
);

const hashtagTiersSchema = new Schema(
  {
    high: { type: [String], default: [] },
    medium: { type: [String], default: [] },
    low: { type: [String], default: [] },
  },
  { _id: false },
);

const instagramPostSchema = new Schema(
  {
    channelId: { type: Schema.Types.ObjectId, ref: 'InstagramChannel', required: true, index: true },
    queueItemId: { type: Schema.Types.ObjectId, ref: 'InstagramQueueItem', default: null, index: true },
    topic: { type: String, required: true, trim: true, maxlength: INSTAGRAM_LIMITS.TOPIC_MAX },
    title: { type: String, default: '', trim: true, maxlength: INSTAGRAM_LIMITS.TOPIC_MAX },
    youtubeTitle: { type: String, default: '', trim: true, maxlength: INSTAGRAM_LIMITS.TOPIC_MAX },
    brief: { type: String, default: '', trim: true, maxlength: INSTAGRAM_LIMITS.BRIEF_MAX },
    designConcept: { type: String, default: '' },
    visualStyle: { type: String, default: '' },
    visualAnchors: { type: visualAnchorsSchema, default: () => ({}) },
    slides: { type: [slideSchema], default: [] },
    caption: { type: String, default: '' },
    hashtags: { type: [String], default: [] },
    hashtagTiers: { type: hashtagTiersSchema, default: () => ({}) },
    coverImageUrl: { type: String, default: null },
    video: { type: videoSchema, default: () => ({}) },
    status: { type: String, default: 'ready' },
  },
  { timestamps: true },
);

export const InstagramPostModel = model(POST_COLLECTION, instagramPostSchema);
