import { absoluteUrl } from '../lib/site-config.js';
import { listSignals } from '../lib/content/api.js';
import { signalUrl } from '../lib/content/signal-url.js';

export const revalidate = 86400;

export default async function sitemap() {
  const now = new Date();
  const core = [
    { path: '/', priority: 1.0, changeFrequency: 'daily' },
    { path: '/devocional', priority: 0.9, changeFrequency: 'daily' },
    { path: '/salmo', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/oracao', priority: 0.8, changeFrequency: 'weekly' },
  ];

  const coreEntries = core.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
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
    // API unavailable at build time — signal URLs excluded from sitemap
  }

  return [...coreEntries, ...signalEntries];
}
