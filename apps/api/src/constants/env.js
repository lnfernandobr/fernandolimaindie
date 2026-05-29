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
  OPENAI_API_KEY: '',
  OPENAI_MODEL: 'gpt-5-mini',
  OPENAI_MOCK_MODE: 'false',
  CRON_ENABLED: 'false',
  CRON_GENERATION_SCHEDULE: '0 3 * * *',
  CRON_GENERATION_DAILY_LIMIT: 5,
  ELEVENLABS_API_KEY: '',
  ELEVENLABS_VOICE_ID: 'pNInz6obpgDQGcFmaJgB',
  AWS_ACCESS_KEY_ID: '',
  AWS_SECRET_ACCESS_KEY: '',
  AWS_REGION: 'us-east-1',
  AWS_S3_BUCKET: '',
  AWS_S3_PUBLIC_URL: '',
  MEDIA_MOCK_MODE: 'true',
  SOULSIGNAL_REVALIDATE_URL: '',
  SOULSIGNAL_REVALIDATE_TOKEN: '',
  SOULSIGNAL_SITE_URL: 'https://umsinaldefe.com.br',
  INDEXNOW_KEY: '',
  INDEXNOW_MOCK_MODE: 'true',
});

export const ENV_CONSTRAINTS = Object.freeze({
  JWT_SECRET_MIN_LENGTH: 16,
  MONGODB_URI_MIN_LENGTH: 1,
});

export const ENV_FILES = Object.freeze({
  LOCAL: '.env.local',
  DEFAULT: '.env',
});
