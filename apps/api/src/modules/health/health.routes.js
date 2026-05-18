import { Router } from 'express';
import { PATHS } from '../../constants/api.js';
import { handleHealth } from './health.controller.js';

export const createHealthRouter = () => {
  const router = Router();
  router.get(PATHS.ROOT, handleHealth);
  return router;
};
