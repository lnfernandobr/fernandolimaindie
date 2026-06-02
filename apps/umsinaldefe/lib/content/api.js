import { z } from 'zod';
import {
  entitySchema,
  paginatedSchema,
  signalSchema,
  signalSummarySchema,
  topicSchema,
  topicSummarySchema,
} from './types.js';
import { env } from '@/lib/env.js';

/**
 * Cliente da API de conteúdo (apps/api, https://api.fazedorismo.com/api/v1).
 *
 * Tudo é buscado em RUNTIME (cache: 'no-store'), então as páginas que usam
 * estas funções são renderizadas no servidor a cada request (nada estático).
 * Os schemas zod (./types.js) validam e fazem a coerção de datas.
 */

const BASE = env.UMSINALDEFE_API_URL;

async function apiGet(path, params) {
  const qs = params
    ? Object.entries(params)
        .filter(([, v]) => v != null && v !== '')
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&')
    : '';
  const url = `${BASE}${path}${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!res.ok) {
    const err = new Error(`API ${res.status} em ${path}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export const getSignal = async (slug) =>
  signalSchema.parse(await apiGet(`/signals/${encodeURIComponent(slug)}`));

export const listSignals = async (params = {}) =>
  paginatedSchema(signalSummarySchema).parse(await apiGet('/signals', params));

export const getRelatedSignals = async (slug) => {
  const data = await apiGet(`/signals/${encodeURIComponent(slug)}/related`);
  return z.array(signalSummarySchema).parse(data?.items ?? []);
};

export const getTopic = async (slug) =>
  topicSchema.parse(await apiGet(`/topics/${encodeURIComponent(slug)}`));

export const listTopics = async (params = {}) =>
  paginatedSchema(topicSummarySchema).parse(await apiGet('/topics', params));

export const getEntity = async (slug) =>
  entitySchema.parse(await apiGet(`/entities/${encodeURIComponent(slug)}`));

export const listEntities = async (params = {}) =>
  paginatedSchema(entitySchema).parse(await apiGet('/entities', params));
