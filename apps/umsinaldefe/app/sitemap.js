import { absoluteUrl } from '../lib/site-config.js';
import { listSignals } from '../lib/content/api.js';
import { signalUrl } from '../lib/content/signal-url.js';
import { INTENT_SLUGS } from '../lib/content/intents.js';
import { VERSE_TOPIC_SLUGS } from '../lib/content/biblia.js';
import { listPosts } from '../lib/content/blog.js';

export const revalidate = 86400;

export default async function sitemap() {
  const now = new Date();
  const core = [
    { path: '/', priority: 1.0, changeFrequency: 'daily' },
    { path: '/biblia', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/devocional', priority: 0.9, changeFrequency: 'daily' },
    { path: '/salmo', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/oracao', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/blog', priority: 0.8, changeFrequency: 'weekly' },
  ];

  const coreEntries = core.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  const intentEntries = Object.values(INTENT_SLUGS).map((intent) => ({
    url: absoluteUrl(`/${intent}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const bibliaEntries = VERSE_TOPIC_SLUGS.map((slug) => ({
    url: absoluteUrl(`/biblia/${slug}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const blogEntries = listPosts().map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: p.updatedAt ?? now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  let signalEntries = [];
  try {
    const allSignals = [];
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      const result = await listSignals({ limit: 100, page });
      allSignals.push(...result.items);
      hasMore = page < result.pages;
      page++;
    }
    signalEntries = allSignals.map((s) => ({
      url: absoluteUrl(signalUrl(s)),
      lastModified: s.publishedAt ?? now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch {
    // Sem conteúdo no build: URLs de signals ficam de fora do sitemap
  }

  return [
    ...coreEntries,
    ...intentEntries,
    ...bibliaEntries,
    ...blogEntries,
    ...signalEntries,
  ];
}
