import { Router } from 'express';
import { PATHS } from '../../constants/api.js';
import { asyncHandler } from '../../lib/async-handler.js';
import { requireAuth } from '../../middleware/authenticate.js';
import {
  handleCreateTopic,
  handleGetTopic,
  handleListTopics,
  handleUpdateTopic,
} from './topics.controller.js';

export const createTopicsRouter = () => {
  const router = Router();
  router.get(PATHS.ROOT, asyncHandler(handleListTopics));
  router.get(PATHS.SLUG_PARAM, asyncHandler(handleGetTopic));
  router.post(PATHS.ROOT, requireAuth, asyncHandler(handleCreateTopic));
  router.patch(PATHS.SLUG_PARAM, requireAuth, asyncHandler(handleUpdateTopic));
  return router;
};
