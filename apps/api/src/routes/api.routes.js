import { Router } from 'express';
import { PATHS } from '../constants/api.js';
import { createAuthRouter } from '../modules/auth/index.js';
import { createWaitlistRouter } from '../modules/waitlist/index.js';
import { createSignalsRouter } from '../modules/signals/index.js';
import { createTopicsRouter } from '../modules/topics/index.js';
import { createEntitiesRouter } from '../modules/entities/index.js';
import { createGenerationRouter } from '../modules/generation/index.js';
import { createMediaRouter } from '../modules/media/index.js';

export const createApiRouter = () => {
  const router = Router();
  router.use(PATHS.AUTH, createAuthRouter());
  router.use(PATHS.WAITLIST, createWaitlistRouter());
  router.use(PATHS.SIGNALS, createSignalsRouter());
  router.use(PATHS.TOPICS, createTopicsRouter());
  router.use(PATHS.ENTITIES, createEntitiesRouter());
  router.use(PATHS.GENERATION, createGenerationRouter());
  router.use(PATHS.MEDIA, createMediaRouter());
  return router;
};
