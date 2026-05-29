import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export const triggerRevalidation = async (tags = ['signals']) => {
  if (!env.SOULSIGNAL_REVALIDATE_URL || !env.SOULSIGNAL_REVALIDATE_TOKEN) return;

  try {
    const res = await fetch(env.SOULSIGNAL_REVALIDATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: env.SOULSIGNAL_REVALIDATE_TOKEN, tags }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      logger.warn({ status: res.status }, 'revalidation request failed');
      return;
    }
    const data = await res.json();
    logger.info({ revalidated: data.revalidated }, 'isr revalidation triggered');
  } catch (err) {
    logger.warn({ err }, 'revalidation request error');
  }
};
