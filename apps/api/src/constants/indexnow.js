export const INDEXNOW_DEFAULTS = Object.freeze({
  ENDPOINT: 'https://api.indexnow.org/indexnow',
  GOOGLE_SITEMAP_PING: 'https://www.google.com/ping',
  TIMEOUT_MS: 10000,
  MOCK_MODE: 'true',
});

export const INDEXNOW_ERRORS = Object.freeze({
  SUBMIT_FAILED: 'IndexNow submission failed',
  KEY_MISSING: 'INDEXNOW_KEY is not configured',
  SITE_URL_MISSING: 'SOULSIGNAL_SITE_URL is not configured',
});
