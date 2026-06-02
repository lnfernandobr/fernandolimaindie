import { siteConfig, absoluteUrl } from '../lib/site-config.js';

export default function robots() {
  return {
    rules: [
      // Bloqueia crawlers nas URLs staging/vercel.app pra evitar duplicatas canônicas
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/static/'],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteConfig.url,
  };
}
