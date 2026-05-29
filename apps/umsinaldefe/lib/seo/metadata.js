import { siteConfig, absoluteUrl } from '../site-config.js';

export const buildMetadata = ({
  title,
  description,
  path = '/',
  image,
  noIndex = false,
  type = 'website',
  publishedTime,
  modifiedTime,
} = {}) => {
  const resolvedTitle = title || siteConfig.defaultTitle;
  const resolvedDescription = description || siteConfig.description;
  const url = absoluteUrl(path);
  const ogImage = image || absoluteUrl(siteConfig.ogImage);

  return {
    metadataBase: new URL(siteConfig.url),
    title: resolvedTitle,
    description: resolvedDescription,
    applicationName: siteConfig.name,
    formatDetection: { telephone: false, email: false, address: false },
    alternates: {
      canonical: path,
      languages: { 'pt-BR': path, 'x-default': path },
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
    openGraph: {
      type,
      siteName: siteConfig.name,
      locale: 'pt_BR',
      title: resolvedTitle,
      description: resolvedDescription,
      url,
      images: [{ url: ogImage, width: 1200, height: 630, alt: resolvedTitle }],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDescription,
      images: [ogImage],
    },
    verification: {
      google: siteConfig.verification.google || undefined,
      other: siteConfig.verification.bing
        ? { 'msvalidate.01': siteConfig.verification.bing }
        : undefined,
    },
  };
};
