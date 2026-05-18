import { Router } from 'express';
import { PATHS } from '../constants/api.js';
import { CONTENT_TYPES } from '../constants/http.js';
import { renderLandingPage } from '../views/landing/landing.js';

export const createLandingRouter = () => {
  const router = Router();
  router.get(PATHS.ROOT, (_req, res) => {
    res.type(CONTENT_TYPES.HTML).send(renderLandingPage());
  });
  return router;
};
