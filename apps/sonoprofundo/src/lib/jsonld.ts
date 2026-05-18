import type { ChannelDto, PostDto } from '@fernandolimaindie/shared';
import { abs } from './seo';
import { SITE_URL } from './config';

export function organizationLd(channel: ChannelDto) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}#org`,
    name: channel.name,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
  };
}

export function websiteLd(channel: ChannelDto) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    url: SITE_URL,
    name: channel.name,
    description: `${channel.name} — conteúdo, ferramentas e produtos sobre ${channel.niche}.`,
    inLanguage: channel.language,
    publisher: { '@id': `${SITE_URL}#org` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((i, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: i.name,
      item: i.url,
    })),
  };
}

export function articleLd(channel: ChannelDto, post: PostDto) {
  const url = abs(`/blog/${post.slug}`);
  const isHowTo = (post.howToSteps?.length ?? 0) >= 2 || post.format === 'how-to';
  return {
    '@context': 'https://schema.org',
    '@type': isHowTo ? 'HowTo' : post.format === 'review' ? 'Review' : 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    headline: post.title,
    description: post.metaDescription,
    inLanguage: post.language,
    datePublished: post.publishedAt,
    dateModified: post.updatedAtContent ?? post.updatedAt,
    image: [
      {
        '@type': 'ImageObject',
        url: post.coverImage.url,
        width: post.coverImage.width,
        height: post.coverImage.height,
      },
    ],
    keywords: post.keywords?.length ? post.keywords.join(', ') : undefined,
    articleSection: post.category?.name,
    wordCount: post.wordCount,
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#org`,
      name: channel.name,
    },
    step: isHowTo
      ? post.howToSteps?.map((s, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: s.name,
          text: s.text,
          image: s.imageUrl,
        }))
      : undefined,
  };
}

export function faqLd(post: PostDto) {
  if (!post.faq || post.faq.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faq.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function collectionPageLd(opts: {
  name: string;
  description?: string;
  url: string;
  posts: PostDto[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: opts.posts.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: abs(`/blog/${p.slug}`),
        name: p.title,
      })),
    },
  };
}
