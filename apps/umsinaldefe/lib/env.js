import { z } from 'zod';

const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url()
    .default('https://umsinaldefe.com.br'),
  NEXT_PUBLIC_SITE_NAME: z.string().default('Um Sinal de Fé'),
  NEXT_PUBLIC_SITE_LOCALE: z.string().default('pt-BR'),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: z.string().optional(),
  NEXT_PUBLIC_BING_SITE_VERIFICATION: z.string().optional(),
  NEXT_PUBLIC_ADSENSE_CLIENT: z.string().optional(),
  UMSINALDEFE_API_URL: z.string().url().default('http://localhost:4000'),
  REVALIDATE_TOKEN: z.string().default('dev-revalidate-token'),
  INDEXNOW_KEY: z.string().default(''),
});

const parsed = schema.parse({
  UMSINALDEFE_API_URL: process.env.UMSINALDEFE_API_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
  NEXT_PUBLIC_SITE_LOCALE: process.env.NEXT_PUBLIC_SITE_LOCALE,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  NEXT_PUBLIC_BING_SITE_VERIFICATION: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
  NEXT_PUBLIC_ADSENSE_CLIENT: process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
  REVALIDATE_TOKEN: process.env.REVALIDATE_TOKEN,
  INDEXNOW_KEY: process.env.INDEXNOW_KEY,
});

export const env = parsed;
