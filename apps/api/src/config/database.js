import mongoose from 'mongoose';
import { DB_SERVER_SELECTION_TIMEOUT_MS } from '../constants/server.js';
import { env } from './env.js';
import { logger } from './logger.js';

const CREDENTIAL_PATTERN = /\/\/.*?@/;
const REDACTED_CREDENTIAL = '//***@';

const redactCredentials = (uri) => uri.replace(CREDENTIAL_PATTERN, REDACTED_CREDENTIAL);

mongoose.set('strictQuery', true);

export const connectDatabase = async () => {
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: DB_SERVER_SELECTION_TIMEOUT_MS,
  });
  logger.info({ uri: redactCredentials(env.MONGODB_URI) }, 'database connected');
};

export const disconnectDatabase = () => mongoose.disconnect();
