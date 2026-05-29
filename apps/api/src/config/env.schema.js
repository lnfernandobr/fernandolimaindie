import { z } from 'zod';
import { ENV_CONSTRAINTS, ENV_DEFAULTS, LOG_LEVELS, NODE_ENVIRONMENTS } from '../constants/env.js';

export const envSchema = z.object({
  NODE_ENV: z.enum(NODE_ENVIRONMENTS).default(ENV_DEFAULTS.NODE_ENV),
  API_PORT: z.coerce.number().int().positive().default(ENV_DEFAULTS.API_PORT),
  MONGODB_URI: z
    .string()
    .min(ENV_CONSTRAINTS.MONGODB_URI_MIN_LENGTH)
    .default(ENV_DEFAULTS.MONGODB_URI),
  JWT_SECRET: z
    .string()
    .min(ENV_CONSTRAINTS.JWT_SECRET_MIN_LENGTH)
    .default(ENV_DEFAULTS.JWT_SECRET),
  JWT_EXPIRES_IN: z.string().default(ENV_DEFAULTS.JWT_EXPIRES_IN),
  LOG_LEVEL: z.enum(LOG_LEVELS).default(ENV_DEFAULTS.LOG_LEVEL),
  ADMIN_BOOTSTRAP_NAME: z.string().default(ENV_DEFAULTS.ADMIN_BOOTSTRAP_NAME),
  ADMIN_BOOTSTRAP_USERNAME: z.string().default(ENV_DEFAULTS.ADMIN_BOOTSTRAP_USERNAME),
  ADMIN_BOOTSTRAP_PASSWORD: z.string().default(ENV_DEFAULTS.ADMIN_BOOTSTRAP_PASSWORD),
  ALLOWED_ORIGINS: z.string().default(ENV_DEFAULTS.ALLOWED_ORIGINS),
  OPENAI_API_KEY: z.string().default(ENV_DEFAULTS.OPENAI_API_KEY),
  OPENAI_MODEL: z.string().default(ENV_DEFAULTS.OPENAI_MODEL),
  OPENAI_MOCK_MODE: z
    .union([z.literal('true'), z.literal('false')])
    .default(ENV_DEFAULTS.OPENAI_MOCK_MODE)
    .transform((v) => v === 'true'),
  CRON_ENABLED: z
    .union([z.literal('true'), z.literal('false')])
    .default(ENV_DEFAULTS.CRON_ENABLED)
    .transform((v) => v === 'true'),
  CRON_GENERATION_SCHEDULE: z.string().default(ENV_DEFAULTS.CRON_GENERATION_SCHEDULE),
  CRON_GENERATION_DAILY_LIMIT: z.coerce
    .number()
    .int()
    .min(1)
    .max(20)
    .default(ENV_DEFAULTS.CRON_GENERATION_DAILY_LIMIT),
  ELEVENLABS_API_KEY: z.string().default(ENV_DEFAULTS.ELEVENLABS_API_KEY),
  ELEVENLABS_VOICE_ID: z.string().default(ENV_DEFAULTS.ELEVENLABS_VOICE_ID),
  AWS_ACCESS_KEY_ID: z.string().default(ENV_DEFAULTS.AWS_ACCESS_KEY_ID),
  AWS_SECRET_ACCESS_KEY: z.string().default(ENV_DEFAULTS.AWS_SECRET_ACCESS_KEY),
  AWS_REGION: z.string().default(ENV_DEFAULTS.AWS_REGION),
  AWS_S3_BUCKET: z.string().default(ENV_DEFAULTS.AWS_S3_BUCKET),
  AWS_S3_PUBLIC_URL: z.string().default(ENV_DEFAULTS.AWS_S3_PUBLIC_URL),
  MEDIA_MOCK_MODE: z
    .union([z.literal('true'), z.literal('false')])
    .default(ENV_DEFAULTS.MEDIA_MOCK_MODE)
    .transform((v) => v === 'true'),
  SOULSIGNAL_REVALIDATE_URL: z.string().default(ENV_DEFAULTS.SOULSIGNAL_REVALIDATE_URL),
  SOULSIGNAL_REVALIDATE_TOKEN: z.string().default(ENV_DEFAULTS.SOULSIGNAL_REVALIDATE_TOKEN),
});
