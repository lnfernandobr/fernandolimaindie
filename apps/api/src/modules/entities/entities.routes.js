import { Router } from 'express';
import { PATHS } from '../../constants/api.js';
import { asyncHandler } from '../../lib/async-handler.js';
import { requireAuth } from '../../middleware/authenticate.js';
import {
  handleCreateEntity,
  handleGetEntity,
  handleListEntities,
  handleUpdateEntity,
} from './entities.controller.js';

export const createEntitiesRouter = () => {
  const router = Router();
  router.get(PATHS.ROOT, asyncHandler(handleListEntities));
  router.get(PATHS.SLUG_PARAM, asyncHandler(handleGetEntity));
  router.post(PATHS.ROOT, requireAuth, asyncHandler(handleCreateEntity));
  router.patch(PATHS.SLUG_PARAM, requireAuth, asyncHandler(handleUpdateEntity));
  return router;
};
