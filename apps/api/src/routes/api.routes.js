import { Router } from 'express';
import { PATHS } from '../constants/api.js';
import { createAuthRouter } from '../modules/auth/index.js';

export const createApiRouter = () => {
  const router = Router();
  router.use(PATHS.AUTH, createAuthRouter());
  return router;
};
