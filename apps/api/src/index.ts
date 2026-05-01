import { createApp } from './app.js';
import { connectDb, disconnectDb } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { bootstrapScheduler } from './scheduler/index.js';
import { bootstrapAdmin } from './seed/bootstrapAdmin.js';
import { seedDemoContent } from './seed/demoContent.js';
import { ensureUploadsDir } from './services/uploads.js';

async function main() {
  await connectDb();
  await ensureUploadsDir();
  await bootstrapAdmin();
  await seedDemoContent();
  await bootstrapScheduler();
  const app = createApp();
  const server = app.listen(env.API_PORT, () => {
    logger.info({ port: env.API_PORT }, 'api listening');
  });

  const shutdown = async (sig: string) => {
    logger.info({ sig }, 'shutting down');
    server.close();
    await disconnectDb();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.error({ err }, 'fatal startup error');
  process.exit(1);
});
