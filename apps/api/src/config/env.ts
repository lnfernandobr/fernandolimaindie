import dotenv from 'dotenv';
import path from 'node:path';
import { z } from 'zod';

// .env.local tem precedência (dev), depois .env (defaults / produção).
// Mesma convenção que o Next.js usa.
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1).default('mongodb://localhost:27017/blog-network'),
  JWT_SECRET: z.string().min(16).default('dev-secret-change-me-please-32chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REVALIDATE_SECRET: z.string().min(8).default('dev-revalidate-secret'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  ADMIN_BOOTSTRAP_NAME: z.string().default('Fernando'),
  ADMIN_BOOTSTRAP_USERNAME: z.string().default('fernando'),
  ADMIN_BOOTSTRAP_PASSWORD: z.string().default('Fz9mPx7Kq2vRtY8n'),

  // CORS: lista de origins permitidos, separados por vírgula. "*" = aberto.
  // Em produção: "https://admin.exemplo.com,https://meusite.com"
  ALLOWED_ORIGINS: z.string().default('*'),

  AI_PROVIDER: z.enum(['mock', 'claude', 'openai']).default('mock'),
  AI_MODEL: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  // Provider de imagem (independente do de texto).
  // Em produção, mesmo com AI_PROVIDER=claude, recomenda-se IMAGE_PROVIDER=openai
  // pra usar gpt-image-1 (Anthropic não gera imagem).
  IMAGE_PROVIDER: z.enum(['mock', 'openai']).default('mock'),
  IMAGE_MODEL: z.string().optional(),

  // URL pública da API — usada pra montar URLs de imagens em /uploads/.
  // Dev: http://localhost:4000. Prod: https://api.SEUDOMINIO.com.
  PUBLIC_API_URL: z.string().optional(),

  // Google PageSpeed Insights API.
  // Sem chave: ~1 req/s, sujeito ao rate limit do Google.
  // Com chave (gratuita, sem cartão): 25k req/dia.
  // https://console.cloud.google.com/apis/credentials
  GOOGLE_PAGESPEED_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
