import { z } from 'zod';
import {
  INSTAGRAM_LIMITS,
  INSTAGRAM_QUEUE_ACTION_VALUES,
  INSTAGRAM_QUEUE_STATUSES,
} from '../../constants/instagram.js';

const objectId = z.string().regex(/^[a-f0-9]{24}$/i);

export const createQueueItemSchema = z.object({
  topic: z.string().trim().min(1).max(INSTAGRAM_LIMITS.TOPIC_MAX),
  brief: z.string().trim().max(INSTAGRAM_LIMITS.BRIEF_MAX).default(''),
  scheduledFor: z.coerce.date().nullish(),
});

export const updateQueueItemSchema = z
  .object({
    topic: z.string().trim().min(1).max(INSTAGRAM_LIMITS.TOPIC_MAX).optional(),
    brief: z.string().trim().max(INSTAGRAM_LIMITS.BRIEF_MAX).optional(),
    scheduledFor: z.coerce.date().nullish(),
    status: z.enum(INSTAGRAM_QUEUE_STATUSES).optional(),
    action: z.enum(INSTAGRAM_QUEUE_ACTION_VALUES).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'empty patch' });

export const channelIdParamSchema = z.object({ channelId: objectId });

export const queueItemParamSchema = z.object({
  channelId: objectId,
  itemId: objectId,
});

export const listQueueQuerySchema = z.object({
  status: z.enum(INSTAGRAM_QUEUE_STATUSES).optional(),
});
