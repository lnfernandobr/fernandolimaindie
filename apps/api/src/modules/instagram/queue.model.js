import { Schema, model } from 'mongoose';
import {
  INSTAGRAM_LIMITS,
  INSTAGRAM_QUEUE_STATUS,
  INSTAGRAM_QUEUE_STATUSES,
} from '../../constants/instagram.js';

const QUEUE_COLLECTION = 'InstagramQueueItem';

const queueItemSchema = new Schema(
  {
    channelId: { type: Schema.Types.ObjectId, ref: 'InstagramChannel', required: true, index: true },
    topic: { type: String, required: true, trim: true, maxlength: INSTAGRAM_LIMITS.TOPIC_MAX },
    brief: { type: String, default: '', trim: true, maxlength: INSTAGRAM_LIMITS.BRIEF_MAX },
    priority: { type: Number, default: 100, index: true },
    status: {
      type: String,
      enum: INSTAGRAM_QUEUE_STATUSES,
      default: INSTAGRAM_QUEUE_STATUS.PENDING,
      index: true,
    },
    scheduledFor: { type: Date, default: null },
    postId: { type: Schema.Types.ObjectId, ref: 'InstagramPost', default: null },
    error: { type: String, default: null },
    generationStartedAt: { type: Date, default: null },
    generationFinishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

queueItemSchema.index({ channelId: 1, priority: 1, createdAt: 1 });

export const InstagramQueueItemModel = model(QUEUE_COLLECTION, queueItemSchema);
