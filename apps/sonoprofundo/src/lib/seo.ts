import type { Metadata } from 'next';
import type { CategoryDto, ChannelDto, PostDto } from '@fernandolimaindie/shared';
import { SITE_URL } from './config';

export function abs(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function toSentenceCase(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function buildBaseMetadata(channel: ChannelDto): Metadata {
  const siteName = toSentenceCase(channel.name);
  const niche = channel.niche.charAt(0).toLowerCase() + channel.niche.slice(1);
  const description = `Aprenda a dormir melhor. Guias práticos e ferramentas sobre ${niche}.`;
  return {
    metadataBase: new URL(SITE_URL),
    applicationName: siteName,
    title: { default: siteName, template: `%s · ${siteName}` },
    description,
    alternates: {
      canonical: '/',
      types: {
        'application/rss+xml': '/feed.xml',
        'application/atom+xml': '/atom.xml',
      },
    },
    openGraph: {
      type: 'website',
      siteName,
      locale: 'pt_BR',
      url: SITE_URL,
      title: siteName,
      description,
      images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: siteName }],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description,
      images: ['/opengraph-image.png'],
    },
    robots: {
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
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
      ],
      apple: '/apple-touch-icon.png',
    },
  };
}

export function postMetadata(channel: ChannelDto, post: PostDto): Metadata {
  const url = abs(`/blog/${post.slug}`);
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      siteName: channel.name,
      title: post.metaTitle,
      description: post.metaDescription,
      locale: 'pt_BR',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAtContent ?? post.updatedAt,
      section: post.category?.name,
      tags: post.tags,
      images: [
        {
          url: post.coverImage.url,
          width: post.coverImage.width,
          height: post.coverImage.height,
          alt: post.coverImage.alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle,
      description: post.metaDescription,
      images: [post.coverImage.url],
    },
  };
}

export function categoryMetadata(channel: ChannelDto, category: CategoryDto): Metadata {
  const url = abs(`/blog?cat=${category.slug}`);
  return {
    title: `${category.name} — ${channel.name}`,
    description: category.description ?? `Posts da categoria ${category.name}.`,
    alternates: { canonical: url },
    openGraph: { type: 'website', url, title: category.name, description: category.description ?? '' },
  };
}

