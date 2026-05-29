import { Router } from 'express';
import { MEDIA_PATHS } from '../../constants/media.js';
import { asyncHandler } from '../../lib/async-handler.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { handleGenerateAudio, handleGenerateImage } from './media.controller.js';

export const createMediaRouter = () => {
  const router = Router();
  router.post(`${MEDIA_PATHS.AUDIO}${MEDIA_PATHS.SLUG_PARAM}`, requireAuth, asyncHandler(handleGenerateAudio));
  router.post(`${MEDIA_PATHS.IMAGE}${MEDIA_PATHS.SLUG_PARAM}`, requireAuth, asyncHandler(handleGenerateImage));
  return router;
};
