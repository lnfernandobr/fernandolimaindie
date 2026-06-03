import { Router } from 'express';
import { INSTAGRAM_PATHS } from '../../constants/instagram.js';
import { asyncHandler } from '../../lib/async-handler.js';
import { requireAuth } from '../../middleware/authenticate.js';
import {
  handleCreateChannel,
  handleDeleteChannel,
  handleGetChannel,
  handleListChannels,
  handleUpdateChannel,
} from './channels.controller.js';
import {
  handleCreateQueueItem,
  handleDeleteQueueItem,
  handleListQueue,
  handleRunQueueItem,
  handleUpdateQueueItem,
} from './queue.controller.js';
import {
  handleGetPost,
  handleListPostsByChannel,
} from './posts.controller.js';

export const createInstagramRouter = () => {
  const router = Router();

  router.get(INSTAGRAM_PATHS.CHANNELS, requireAuth, asyncHandler(handleListChannels));
  router.post(INSTAGRAM_PATHS.CHANNELS, requireAuth, asyncHandler(handleCreateChannel));
  router.get(
    `${INSTAGRAM_PATHS.CHANNELS}${INSTAGRAM_PATHS.CHANNEL_PARAM}`,
    requireAuth,
    asyncHandler(handleGetChannel),
  );
  router.patch(
    `${INSTAGRAM_PATHS.CHANNELS}${INSTAGRAM_PATHS.CHANNEL_PARAM}`,
    requireAuth,
    asyncHandler(handleUpdateChannel),
  );
  router.delete(
    `${INSTAGRAM_PATHS.CHANNELS}${INSTAGRAM_PATHS.CHANNEL_PARAM}`,
    requireAuth,
    asyncHandler(handleDeleteChannel),
  );

  router.get(
    `${INSTAGRAM_PATHS.CHANNELS}${INSTAGRAM_PATHS.CHANNEL_PARAM}${INSTAGRAM_PATHS.QUEUE}`,
    requireAuth,
    asyncHandler(handleListQueue),
  );
  router.post(
    `${INSTAGRAM_PATHS.CHANNELS}${INSTAGRAM_PATHS.CHANNEL_PARAM}${INSTAGRAM_PATHS.QUEUE}`,
    requireAuth,
    asyncHandler(handleCreateQueueItem),
  );
  router.patch(
    `${INSTAGRAM_PATHS.CHANNELS}${INSTAGRAM_PATHS.CHANNEL_PARAM}${INSTAGRAM_PATHS.QUEUE}${INSTAGRAM_PATHS.QUEUE_ITEM_PARAM}`,
    requireAuth,
    asyncHandler(handleUpdateQueueItem),
  );
  router.delete(
    `${INSTAGRAM_PATHS.CHANNELS}${INSTAGRAM_PATHS.CHANNEL_PARAM}${INSTAGRAM_PATHS.QUEUE}${INSTAGRAM_PATHS.QUEUE_ITEM_PARAM}`,
    requireAuth,
    asyncHandler(handleDeleteQueueItem),
  );
  router.post(
    `${INSTAGRAM_PATHS.CHANNELS}${INSTAGRAM_PATHS.CHANNEL_PARAM}${INSTAGRAM_PATHS.QUEUE}${INSTAGRAM_PATHS.QUEUE_ITEM_PARAM}${INSTAGRAM_PATHS.RUN}`,
    requireAuth,
    asyncHandler(handleRunQueueItem),
  );

  router.get(
    `${INSTAGRAM_PATHS.CHANNELS}${INSTAGRAM_PATHS.CHANNEL_PARAM}${INSTAGRAM_PATHS.POSTS}`,
    requireAuth,
    asyncHandler(handleListPostsByChannel),
  );
  router.get(
    `${INSTAGRAM_PATHS.POSTS}${INSTAGRAM_PATHS.POST_PARAM}`,
    requireAuth,
    asyncHandler(handleGetPost),
  );

  return router;
};
