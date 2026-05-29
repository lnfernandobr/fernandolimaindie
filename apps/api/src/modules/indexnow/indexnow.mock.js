import { logger } from '../../config/logger.js';

export const submitUrlsMock = (urls) => {
  logger.info({ urls, count: urls.length }, '[indexnow mock] would submit URLs');
  return { status: 200, ok: true };
};

export const pingSitemapMock = (sitemapUrl) => {
  logger.info({ sitemapUrl }, '[indexnow mock] would ping sitemap');
  return { status: 200, ok: true };
};
