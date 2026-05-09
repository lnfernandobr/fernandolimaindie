import type { Metadata } from 'next';
import type { CategoryDto, ChannelDto, PostDto } from '@bn/shared';
import { SITE_URL } from './config';

export function abs(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function buildBaseMetadata(channel: ChannelDto): Metadata {
  const description = `${channel.name} — conteúdo, ferramentas e produtos sobre ${channel.niche}.`;
  return {
    metadataBase: new URL(SITE_URL),
    applicationName: channel.name,
    title: { default: channel.name, template: `%s · ${channel.name}` },
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
      siteName: channel.name,
      locale: 'pt_BR',
      url: SITE_URL,
      title: channel.name,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title: channel.name,
      description,
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
      icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
      apple: '/apple-touch-icon.svg',
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

