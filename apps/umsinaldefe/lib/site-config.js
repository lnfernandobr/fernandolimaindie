import { env } from './env.js';

export const siteConfig = {
  url: env.NEXT_PUBLIC_SITE_URL,
  name: env.NEXT_PUBLIC_SITE_NAME,
  locale: env.NEXT_PUBLIC_SITE_LOCALE,
  defaultTitle: 'Um Sinal de Fé: devocional diário, salmos e orações em português',
  titleTemplate: '%s · Um Sinal de Fé',
  description:
    'Devocional diário, salmos, orações e versículos pra te acompanhar todo dia. Conteúdo cristão acolhedor, em português, pra momentos de fé, ansiedade, sono, proteção e gratidão.',
  brandTagline: 'um sinal de fé todo dia',
  organization: {
    name: 'Um Sinal de Fé',
    email: 'oi@umsinaldefe.com.br',
    sameAs: [],
  },
  ogImage: '/og-default.png',
  twitter: {
    handle: '',
  },
  adsense: {
    client: env.NEXT_PUBLIC_ADSENSE_CLIENT,
  },
  analytics: {
    gaId: env.NEXT_PUBLIC_GA_ID,
  },
  verification: {
    google: env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    bing: env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
  },
};

export const absoluteUrl = (path = '/') => {
  const base = siteConfig.url.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
};
