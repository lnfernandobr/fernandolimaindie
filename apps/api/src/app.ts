import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.js';
import { channelsRouter } from './routes/channels.js';
import { authorsRouter } from './routes/authors.js';
import { categoriesRouter } from './routes/categories.js';
import { tagsRouter } from './routes/tags.js';
import { postsRouter } from './routes/posts.js';
import { runsRouter } from './routes/runs.js';
import { publicRouter } from './routes/public.js';
import { schedulerRouter } from './routes/schedulerInfo.js';
import { settingsRouter } from './routes/settings.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLog } from './middleware/requestLog.js';
import { uploadsDir } from './services/uploads.js';

export function createApp(): Express {
  const app = express();
  app.use(helmet());

  const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean);
  const corsOpts =
    allowed.length === 1 && allowed[0] === '*'
      ? cors()
      : cors({
          origin(origin, cb) {
            // Permite requisições server-to-server (sem Origin) e da lista whitelisted.
            if (!origin || allowed.includes(origin)) return cb(null, true);
            cb(new Error(`Origin ${origin} not allowed by CORS`));
          },
          credentials: true,
        });
  app.use(corsOpts);

  app.use(express.json({ limit: '2mb' }));
  app.use(requestLog);

  // Imagens geradas pela camada de IA ficam em apps/api/uploads/.
  // Cache agressivo (são imutáveis — hash no nome).
  app.use(
    '/uploads',
    express.static(uploadsDir(), {
      maxAge: '30d',
      immutable: true,
      fallthrough: false,
    }),
  );

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/channels', channelsRouter);
  app.use('/api/v1/authors', authorsRouter);
  app.use('/api/v1/categories', categoriesRouter);
  app.use('/api/v1/tags', tagsRouter);
  app.use('/api/v1/posts', postsRouter);
  app.use('/api/v1/runs', runsRouter);
  app.use('/api/v1/scheduler', schedulerRouter);
  app.use('/api/v1/settings', settingsRouter);

  app.use('/api/v1/public', publicRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
