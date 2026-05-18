export const NODE_ENVIRONMENTS = Object.freeze(['development', 'test', 'production']);
export const LOG_LEVELS = Object.freeze(['fatal', 'error', 'warn', 'info', 'debug', 'trace']);

export const ENV_DEFAULTS = Object.freeze({
  NODE_ENV: 'development',
  API_PORT: 4000,
  MONGODB_URI: 'mongodb://localhost:27017/fernandolimaindie',
  JWT_SECRET: 'dev-secret-change-me-please-32chars',
  JWT_EXPIRES_IN: '7d',
  LOG_LEVEL: 'info',
  ADMIN_BOOTSTRAP_NAME: 'Fernando',
  ADMIN_BOOTSTRAP_USERNAME: 'fernando',
  ADMIN_BOOTSTRAP_PASSWORD: 'Fz9mPx7Kq2vRtY8n',
  ALLOWED_ORIGINS: '*',
});

export const ENV_CONSTRAINTS = Object.freeze({
  JWT_SECRET_MIN_LENGTH: 16,
  MONGODB_URI_MIN_LENGTH: 1,
});

export const ENV_FILES = Object.freeze({
  LOCAL: '.env.local',
  DEFAULT: '.env',
});
