import { Router } from 'express';
import { PATHS } from '../../constants/api.js';
import { asyncHandler } from '../../lib/async-handler.js';
import { requireAuth } from '../../middleware/authenticate.js';
import {
  handleCreateSignal,
  handleGetRelatedSignals,
  handleGetSignal,
  handleListSignals,
  handleUpdateSignal,
} from './signals.controller.js';

export const createSignalsRouter = () => {
  const router = Router();
  router.get(PATHS.ROOT, asyncHandler(handleListSignals));
  router.get(PATHS.SIGNAL_RELATED, asyncHandler(handleGetRelatedSignals));
  router.get(PATHS.SLUG_PARAM, asyncHandler(handleGetSignal));
  router.post(PATHS.ROOT, requireAuth, asyncHandler(handleCreateSignal));
  router.patch(PATHS.SLUG_PARAM, requireAuth, asyncHandler(handleUpdateSignal));
  return router;
};
