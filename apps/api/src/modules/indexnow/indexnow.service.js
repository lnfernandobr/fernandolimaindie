import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { INDEXNOW_ERRORS } from '../../constants/indexnow.js';
import { findSignalsBySlugs } from '../signals/signals.repository.js';
import { submitUrls, pingSitemap } from './indexnow.client.js';
import { submitUrlsMock, pingSitemapMock } from './indexnow.mock.js';

const buildSignalUrl = (siteUrl, signal) => `${siteUrl}/${signal.intent}/${signal.slug}`;

export const submitSignalSlugs = async (slugs) => {
  if (!slugs.length) return;

  if (!env.INDEXNOW_KEY) {
    logger.warn(INDEXNOW_ERRORS.KEY_MISSING);
    return;
  }
  if (!env.SOULSIGNAL_SITE_URL) {
    logger.warn(INDEXNOW_ERRORS.SITE_URL_MISSING);
    return;
  }

  const signals = await findSignalsBySlugs(slugs);
  const urls = signals.map((s) => buildSignalUrl(env.SOULSIGNAL_SITE_URL, s));

  if (!urls.length) return;

  try {
    const result = env.INDEXNOW_MOCK_MODE
      ? submitUrlsMock(urls)
      : await submitUrls({ key: env.INDEXNOW_KEY, siteUrl: env.SOULSIGNAL_SITE_URL, urls });

    logger.info({ count: urls.length, status: result.status }, 'indexnow: URLs submitted');
  } catch (err) {
    logger.warn({ err, count: urls.length }, 'indexnow: URL submission failed (non-fatal)');
  }
};

export const submitSitemapPing = async () => {
  if (!env.SOULSIGNAL_SITE_URL) return;

  const sitemapUrl = `${env.SOULSIGNAL_SITE_URL}/sitemap.xml`;

  try {
    const result = env.INDEXNOW_MOCK_MODE
      ? pingSitemapMock(sitemapUrl)
      : await pingSitemap(sitemapUrl);

    logger.info({ sitemapUrl, status: result.status }, 'indexnow: sitemap pinged');
  } catch (err) {
    logger.warn({ err }, 'indexnow: sitemap ping failed (non-fatal)');
  }
};
