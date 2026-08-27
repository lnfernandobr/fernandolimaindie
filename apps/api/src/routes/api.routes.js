import { Router } from 'express';
import { PATHS } from '../constants/api.js';
import { createAuthRouter } from '../modules/auth/index.js';
import { createWaitlistRouter } from '../modules/waitlist/index.js';
import { createTopicsRouter } from '../modules/topics/index.js';
import { createEntitiesRouter } from '../modules/entities/index.js';

export const createApiRouter = () => {
  const router = Router();
  router.use(PATHS.AUTH, createAuthRouter());
  router.use(PATHS.WAITLIST, createWaitlistRouter());
  router.use(PATHS.TOPICS, createTopicsRouter());
  router.use(PATHS.ENTITIES, createEntitiesRouter());
  return router;
};
