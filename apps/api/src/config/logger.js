import { pino } from 'pino';
import { SERVICE_NAME } from '../constants/server.js';
import { env } from './env.js';

const DEVELOPMENT = 'development';

const prettyTransport = Object.freeze({
  target: 'pino-pretty',
  options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
});

const buildTransport = (nodeEnv) => (nodeEnv === DEVELOPMENT ? prettyTransport : undefined);

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: buildTransport(env.NODE_ENV),
  base: { service: SERVICE_NAME },
});
