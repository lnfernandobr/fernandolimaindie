import { z } from 'zod';
import { env } from '../env.js';
import {
  entitySchema,
  paginatedSchema,
  signalSchema,
  signalSummarySchema,
  topicSchema,
  topicSummarySchema,
} from './types.js';

const relatedResponseSchema = z.object({ items: z.array(signalSummarySchema) });

const API_BASE = env.UMSINALDEFE_API_URL.replace(/\/$/, '');
const PREFIX = '/api/v1';

const buildUrl = (path, params) => {
  const url = new URL(`${API_BASE}${PREFIX}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
};

const fetchJson = async (url, init) => {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    next: init?.next ?? { revalidate: 86400 },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status} on ${url}: ${body.slice(0, 200)}`);
  }
  return res.json();
};

export const getSignal = async (slug) => {
  const data = await fetchJson(buildUrl(`/signals/${slug}`), {
    next: { revalidate: 86400, tags: ['signals', `signal-${slug}`] },
  });
  return signalSchema.parse(data);
};

export const listSignals = async (params = {}) => {
  const data = await fetchJson(buildUrl('/signals', params), {
    next: { revalidate: 86400, tags: ['signals'] },
  });
  return paginatedSchema(signalSummarySchema).parse(data);
};

export const getRelatedSignals = async (slug) => {
  const data = await fetchJson(buildUrl(`/signals/${slug}/related`), {
    next: { revalidate: 86400, tags: ['signals', `signal-${slug}`] },
  });
  return relatedResponseSchema.parse(data).items;
};

export const getTopic = async (slug) => {
  const data = await fetchJson(buildUrl(`/topics/${slug}`));
  return topicSchema.parse(data);
};

export const listTopics = async (params = {}) => {
  const data = await fetchJson(buildUrl('/topics', params));
  return paginatedSchema(topicSummarySchema).parse(data);
};

export const getEntity = async (slug) => {
  const data = await fetchJson(buildUrl(`/entities/${slug}`));
  return entitySchema.parse(data);
};

export const listEntities = async (params = {}) => {
  const data = await fetchJson(buildUrl('/entities', params));
  return paginatedSchema(entitySchema).parse(data);
};
