import { siteConfig } from '../lib/site-config.js';

export default function manifest() {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#FBF6EE',
    theme_color: '#B7411E',
    lang: siteConfig.locale,
    orientation: 'portrait',
    categories: ['lifestyle', 'books', 'reference'],
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
    shortcuts: [
      { name: 'Oração da manhã', url: '/manha', description: 'Comece o dia com fé' },
      { name: 'Oração da noite', url: '/noite', description: 'Encerre o dia em paz' },
    ],
  };
}
