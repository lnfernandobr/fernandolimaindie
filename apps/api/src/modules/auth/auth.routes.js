import { Router } from 'express';
import { PATHS } from '../../constants/api.js';
import { asyncHandler } from '../../lib/async-handler.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { handleLogin, handleMe } from './auth.controller.js';

export const createAuthRouter = () => {
  const router = Router();
  router.post(PATHS.AUTH_LOGIN, asyncHandler(handleLogin));
  router.get(PATHS.AUTH_ME, requireAuth, asyncHandler(handleMe));
  return router;
};
