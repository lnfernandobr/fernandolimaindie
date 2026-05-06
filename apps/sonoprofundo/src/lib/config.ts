/**
 * Config central do sonoprofundo.
 *
 * Lê as env vars NEXT_PUBLIC_*, normaliza string vazia (Vercel injeta '' quando
 * a env existe mas não foi preenchida) e expõe HAS_API_CONFIG pro restante do
 * código decidir se faz fetch real ou serve placeholder no build.
 */

function pick(value: string | undefined, fallback: string): string {
  if (!value || value.trim() === '') return fallback;
  return value;
}

const rawApi = process.env.NEXT_PUBLIC_API_URL ?? '';
const rawChannel = process.env.NEXT_PUBLIC_CHANNEL_SLUG ?? '';

export const API_URL = pick(rawApi, 'http://localhost:4000').replace(/\/$/, '');
export const SITE_URL = pick(process.env.NEXT_PUBLIC_SITE_URL, 'http://localhost:3002').replace(/\/$/, '');
export const CHANNEL_SLUG = pick(rawChannel, '');
export const REVALIDATE_SECRET = pick(process.env.REVALIDATE_SECRET, 'dev-revalidate-secret');

/**
 * true → fetch real da API
 * false → renderiza placeholder (Vercel build passa antes da API estar no ar)
 */
export const HAS_API_CONFIG = rawApi.trim() !== '' && rawChannel.trim() !== '';
