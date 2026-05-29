import { INDEXNOW_DEFAULTS } from '../../constants/indexnow.js';

const buildKeyLocation = (siteUrl) => `${siteUrl}/api/indexnow-key`;

export const submitUrls = async ({ key, siteUrl, urls }) => {
  const host = new URL(siteUrl).hostname;
  const body = {
    host,
    key,
    keyLocation: buildKeyLocation(siteUrl),
    urlList: urls,
  };
  const res = await fetch(INDEXNOW_DEFAULTS.ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(INDEXNOW_DEFAULTS.TIMEOUT_MS),
  });
  return { status: res.status, ok: res.status === 200 || res.status === 202 };
};

export const pingSitemap = async (sitemapUrl) => {
  const pingUrl = `${INDEXNOW_DEFAULTS.GOOGLE_SITEMAP_PING}?sitemap=${encodeURIComponent(sitemapUrl)}`;
  const res = await fetch(pingUrl, {
    signal: AbortSignal.timeout(INDEXNOW_DEFAULTS.TIMEOUT_MS),
  });
  return { status: res.status, ok: res.ok };
};
