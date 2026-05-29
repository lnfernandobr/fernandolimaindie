import { Router } from 'express';
import { GENERATION_PATHS } from '../../constants/api.js';
import { asyncHandler } from '../../lib/async-handler.js';
import { requireAuth } from '../../middleware/authenticate.js';
import {
  handleGetStatus,
  handleListSeeds,
  handleRunBatch,
  handleRunOne,
  handleTriggerJob,
} from './generation.controller.js';

export const createGenerationRouter = () => {
  const router = Router();
  router.get(GENERATION_PATHS.STATUS, asyncHandler(handleGetStatus));
  router.get(GENERATION_PATHS.SEEDS, requireAuth, asyncHandler(handleListSeeds));
  router.post(GENERATION_PATHS.RUN, requireAuth, asyncHandler(handleRunOne));
  router.post(GENERATION_PATHS.BATCH, requireAuth, asyncHandler(handleRunBatch));
  router.post(GENERATION_PATHS.TRIGGER, requireAuth, asyncHandler(handleTriggerJob));
  return router;
};
