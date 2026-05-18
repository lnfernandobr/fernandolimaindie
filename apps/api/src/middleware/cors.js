import cors from 'cors';
import { env } from '../config/env.js';
import { CORS_ORIGINS_SEPARATOR, CORS_WILDCARD } from '../constants/server.js';

const parseOrigins = (raw) =>
  raw
    .split(CORS_ORIGINS_SEPARATOR)
    .map((origin) => origin.trim())
    .filter(Boolean);

const isWildcard = (origins) => origins.length === 1 && origins[0] === CORS_WILDCARD;

const buildAllowList = (origins) => (origin, callback) => {
  if (!origin || origins.includes(origin)) return callback(null, true);
  return callback(new Error(`Origin ${origin} not allowed by CORS`));
};

export const corsPolicy = () => {
  const origins = parseOrigins(env.ALLOWED_ORIGINS);
  if (isWildcard(origins)) return cors();
  return cors({ origin: buildAllowList(origins), credentials: true });
};
