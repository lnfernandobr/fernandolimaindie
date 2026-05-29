import { createApp } from './app.js';
import { logger } from './config/logger.js';
import { EXIT_CODES } from './constants/server.js';
import { runBootstrapTasks } from './bootstrap/index.js';
import { startServer } from './server.js';
import { startCronJobs } from './modules/cron/index.js';

const main = async () => {
  const app = createApp();
  await startServer(app, runBootstrapTasks);
  startCronJobs();
};

main().catch((error) => {
  logger.error({ err: error }, 'fatal startup error');
  process.exit(EXIT_CODES.FAILURE);
});
