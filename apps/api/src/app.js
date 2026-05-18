import express from 'express';
import { jsonBodyParser } from './middleware/body-parser.js';
import { corsPolicy } from './middleware/cors.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';
import { requestLog } from './middleware/request-log.js';
import { securityHeaders } from './middleware/security.js';
import { registerRoutes } from './routes/index.js';

const applyGlobalMiddleware = (app) => {
  app.use(securityHeaders());
  app.use(corsPolicy());
  app.use(jsonBodyParser());
  app.use(requestLog);
};

const applyErrorPipeline = (app) => {
  app.use(notFoundHandler);
  app.use(errorHandler);
};

export const createApp = () => {
  const app = express();
  applyGlobalMiddleware(app);
  registerRoutes(app);
  applyErrorPipeline(app);
  return app;
};
