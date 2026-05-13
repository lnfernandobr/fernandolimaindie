import dotenv from 'dotenv';
import path from 'node:path';
import { z } from 'zod';

// .env.local tem precedência (dev), depois .env (defaults / produção).
// Mesma convenção que o Next.js usa.
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Strings vazias ("") exportadas pelo Doppler/CI contam como "não definidas"
// para fins de validação — o .default() precisa estar DENTRO do preprocess
// porque z.string() rejeita undefined.
const envStr = (minLen: number, defaultVal: string) =>
  z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.string().min(minLen).default(defaultVal),
  );

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: envStr(1, 'mongodb://localhost:27017/blog-network'),
  JWT_SECRET: envStr(16, 'dev-secret-change-me-please-32chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REVALIDATE_SECRET: envStr(8, 'dev-revalidate-secret'),
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

  // Storage S3 das imagens geradas. Se `UPLOADS_S3_BUCKET` for setado,
  // usa S3; senão cai pra disco local em apps/api/uploads/.
  UPLOADS_S3_BUCKET: z.string().optional(),
  UPLOADS_S3_REGION: z.string().optional(),
  // Base URL pública das imagens. Default: URL direta S3.
  // Set se usar CloudFront ou domínio customizado (ex: https://cdn.SEUDOMINIO.com).
  UPLOADS_PUBLIC_BASE_URL: z.string().optional(),
  // Credenciais AWS. Em VPS com IAM role anexada, deixe em branco.
  // Em dev/CI use access key/secret.
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),

  // Google PageSpeed Insights API.
  // Sem chave: ~1 req/s, sujeito ao rate limit do Google.
  // Com chave (gratuita, sem cartão): 25k req/dia.
  // https://console.cloud.google.com/apis/credentials
  GOOGLE_PAGESPEED_API_KEY: z.string().optional(),

  // TikTok Content Posting API credentials
  // https://developers.tiktok.com/
  TIKTOK_CLIENT_KEY: z.string().optional(),
  TIKTOK_CLIENT_SECRET: z.string().optional(),

  // TikTok domain ownership verification key. Get from TikTok portal →
  // Content Posting API → Verify domains (file-based method). We serve
  // /tiktok<KEY>.txt with the matching content.
  TIKTOK_DOMAIN_VERIFICATION_KEY: z.string().optional(),

  // Social admin URL — used as OAuth callback redirect destination
  SOCIAL_ADMIN_URL: z.string().optional(),

  // Resend email notifications
  // https://resend.com
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
});

export const env = envSchema.parse(process.env);
