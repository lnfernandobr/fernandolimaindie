import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { logger } from './config/logger.js';
import { EXIT_CODES, SHUTDOWN_SIGNALS } from './constants/server.js';

const startListening = (app) =>
  new Promise((resolve) => {
    const server = app.listen(env.API_PORT, () => {
      logger.info({ port: env.API_PORT }, 'api listening');
      resolve(server);
    });
  });

const registerShutdownHooks = (server) => {
  const shutdown = async (signal) => {
    logger.info({ signal }, 'shutting down');
    server.close();
    await disconnectDatabase();
    process.exit(EXIT_CODES.SUCCESS);
  };
  SHUTDOWN_SIGNALS.forEach((signal) => {
    process.on(signal, () => {
      void shutdown(signal);
    });
  });
};

export const startServer = async (app, beforeListen = async () => {}) => {
  await connectDatabase();
  await beforeListen();
  const server = await startListening(app);
  registerShutdownHooks(server);
  return server;
};
