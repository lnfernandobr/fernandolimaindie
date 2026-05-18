import { API_VERSION_PREFIX, PATHS } from '../constants/api.js';
import { createHealthRouter } from '../modules/health/index.js';
import { createApiRouter } from './api.routes.js';
import { createLandingRouter } from './landing.routes.js';

export const registerRoutes = (app) => {
  app.use(PATHS.HEALTH, createHealthRouter());
  app.use(PATHS.ROOT, createLandingRouter());
  app.use(API_VERSION_PREFIX, createApiRouter());
};
