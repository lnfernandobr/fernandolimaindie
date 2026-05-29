import { siteConfig, absoluteUrl } from '../site-config.js';

const ctx = 'https://schema.org';

export const organizationLd = () => ({
  '@context': ctx,
  '@type': 'Organization',
  '@id': absoluteUrl('/#organization'),
  name: siteConfig.organization.name,
  url: absoluteUrl('/'),
  logo: absoluteUrl('/icon-512.png'),
  email: siteConfig.organization.email,
  inLanguage: siteConfig.locale,
  sameAs: siteConfig.organization.sameAs,
});

export const websiteLd = () => ({
  '@context': ctx,
  '@type': 'WebSite',
  '@id': absoluteUrl('/#website'),
  name: siteConfig.name,
  url: absoluteUrl('/'),
  description: siteConfig.description,
  inLanguage: siteConfig.locale,
  publisher: { '@id': absoluteUrl('/#organization') },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: absoluteUrl('/buscar?q={query}'),
    },
    'query-input': 'required name=query',
  },
});

export const breadcrumbLd = (items) => ({
  '@context': ctx,
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: absoluteUrl(it.path),
  })),
});

export const articleLd = ({
  headline,
  description,
  path,
  image,
  datePublished,
  dateModified,
  author,
}) => ({
  '@context': ctx,
  '@type': 'Article',
  '@id': absoluteUrl(path) + '#article',
  headline,
  description,
  image: image ? [image] : undefined,
  datePublished,
  dateModified: dateModified || datePublished,
  inLanguage: siteConfig.locale,
  mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(path) },
  author: author
    ? { '@type': 'Person', name: author }
    : { '@id': absoluteUrl('/#organization') },
  publisher: { '@id': absoluteUrl('/#organization') },
});

export const faqLd = (entries) => ({
  '@context': ctx,
  '@type': 'FAQPage',
  mainEntity: entries.map((q) => ({
    '@type': 'Question',
    name: q.question,
    acceptedAnswer: { '@type': 'Answer', text: q.answer },
  })),
});

export const speakableLd = (cssSelectors = ['#answer', '#summary']) => ({
  '@context': ctx,
  '@type': 'SpeakableSpecification',
  cssSelector: cssSelectors,
});

export const audioObjectLd = ({ name, url, contentUrl, duration, transcript }) => ({
  '@context': ctx,
  '@type': 'AudioObject',
  name,
  contentUrl,
  url,
  encodingFormat: 'audio/mpeg',
  duration,
  inLanguage: siteConfig.locale,
  transcript,
});

export const ldGraph = (...nodes) => ({
  '@context': ctx,
  '@graph': nodes.filter(Boolean),
});

export const jsonLdScript = (data) => ({
  type: 'application/ld+json',
  dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
});
