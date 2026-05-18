import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.js';
import { channelsRouter } from './routes/channels.js';
import { categoriesRouter } from './routes/categories.js';
import { tagsRouter } from './routes/tags.js';
import { postsRouter } from './routes/posts.js';
import { runsRouter } from './routes/runs.js';
import { publicRouter } from './routes/public.js';
import { schedulerRouter } from './routes/schedulerInfo.js';
import { settingsRouter } from './routes/settings.js';
import { promptsRouter } from './routes/prompts.js';
import { socialRouter } from './routes/social/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLog } from './middleware/requestLog.js';
import { uploadsDir, isUsingS3 } from './services/uploads.js';
import { API_NAME, API_VERSION, API_DESCRIPTION } from './config/version.js';

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

  // Imagens geradas pela camada de IA.
  // Em prod com UPLOADS_S3_BUCKET setado, ficam em S3 e essa rota não é
  // necessária. Em dev (ou prod sem S3) ficam em apps/api/uploads/.
  // Cache agressivo (imutáveis — hash no nome).
  if (!isUsingS3()) {
    app.use(
      '/uploads',
      express.static(uploadsDir(), {
        maxAge: '30d',
        immutable: true,
        fallthrough: false,
      }),
    );
  }

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      name: API_NAME,
      version: API_VERSION,
      uptime: process.uptime(),
    });
  });

  // Landing page — describes the API and shows its current version.
  // HTML self-contained (no external resources) pra funcionar atrás de qualquer
  // proxy/CSP sem precisar de configuração extra.
  app.get('/', (_req, res) => {
    res.type('html').send(renderLandingPage());
  });

  // TikTok domain ownership verification — file-based method.
  // TikTok requests GET /tiktok<KEY>.txt and expects body to be
  // "tiktok-developers-site-verification=<KEY>". Configured via env var.
  app.get(/^\/tiktok([A-Za-z0-9]+)\.txt$/, (req, res) => {
    const expected = env.TIKTOK_DOMAIN_VERIFICATION_KEY;
    const key = (req.params as any)[0] as string | undefined;
    if (!expected || !key || key !== expected) {
      res.status(404).end();
      return;
    }
    res.type('text/plain').send(`tiktok-developers-site-verification=${expected}`);
  });

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/channels', channelsRouter);
  app.use('/api/v1/categories', categoriesRouter);
  app.use('/api/v1/tags', tagsRouter);
  app.use('/api/v1/posts', postsRouter);
  app.use('/api/v1/runs', runsRouter);
  app.use('/api/v1/scheduler', schedulerRouter);
  app.use('/api/v1/settings', settingsRouter);
  app.use('/api/v1/prompts', promptsRouter);

  app.use('/api/v1/social', socialRouter);
  app.use('/api/v1/public', publicRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

function renderLandingPage(): string {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>${API_NAME} · v${API_VERSION}</title>
<style>
  :root {
    color-scheme: light dark;
    --fg: #0f172a;
    --muted: #64748b;
    --bg: #ffffff;
    --card: #f8fafc;
    --border: #e2e8f0;
    --accent: #fe2c55;
    --code-bg: #f1f5f9;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --fg: #e2e8f0;
      --muted: #94a3b8;
      --bg: #0f172a;
      --card: #1e293b;
      --border: #334155;
      --code-bg: #1e293b;
    }
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: var(--bg); color: var(--fg); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, system-ui, sans-serif; line-height: 1.55; }
  .wrap { max-width: 720px; margin: 0 auto; padding: 64px 24px 96px; }
  header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
  .logo { width: 36px; height: 36px; border-radius: 8px; background: var(--accent); color: white; display: grid; place-items: center; font-weight: 700; font-size: 18px; }
  h1 { margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.02em; }
  .badge { display: inline-flex; align-items: center; gap: 6px; padding: 2px 10px; border-radius: 999px; background: var(--card); border: 1px solid var(--border); font-size: 12px; font-weight: 500; color: var(--muted); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  p { color: var(--muted); margin: 16px 0 0; }
  h2 { margin: 36px 0 12px; font-size: 14px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--muted); }
  .endpoints { display: grid; gap: 6px; padding: 16px; background: var(--card); border: 1px solid var(--border); border-radius: 10px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }
  .endpoints div { display: flex; gap: 12px; align-items: center; }
  .method { display: inline-block; min-width: 44px; color: var(--accent); font-weight: 600; font-size: 11px; }
  .path { color: var(--fg); }
  .desc { color: var(--muted); margin-left: auto; font-size: 12px; }
  footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid var(--border); color: var(--muted); font-size: 12px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
  code { background: var(--code-bg); padding: 1px 6px; border-radius: 4px; font-size: 0.9em; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="logo">F</div>
      <div>
        <h1>${API_NAME}</h1>
        <span class="badge">v${API_VERSION}</span>
      </div>
    </header>
    <p>${API_DESCRIPTION}</p>

    <h2>Endpoints</h2>
    <div class="endpoints">
      <div><span class="method">GET</span><span class="path">/health</span><span class="desc">status + uptime + version</span></div>
      <div><span class="method">·</span><span class="path">/api/v1/auth</span><span class="desc">login / me</span></div>
      <div><span class="method">·</span><span class="path">/api/v1/channels</span><span class="desc">canais (CRUD)</span></div>
      <div><span class="method">·</span><span class="path">/api/v1/posts</span><span class="desc">posts gerados</span></div>
      <div><span class="method">·</span><span class="path">/api/v1/runs</span><span class="desc">execuções da pipeline</span></div>
      <div><span class="method">·</span><span class="path">/api/v1/scheduler</span><span class="desc">próximas execuções</span></div>
      <div><span class="method">·</span><span class="path">/api/v1/social</span><span class="desc">contas, campanhas, posts TikTok</span></div>
      <div><span class="method">·</span><span class="path">/api/v1/public</span><span class="desc">consumido pelos blogs</span></div>
    </div>

    <h2>Status</h2>
    <p>Healthcheck JSON em <a href="/health"><code>/health</code></a>.</p>

    <footer>
      <span>© ${year} Fernando — privado.</span>
      <span>node ${process.version}</span>
    </footer>
  </div>
</body>
</html>`;
}
