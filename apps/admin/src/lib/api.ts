'use client';

// Vercel injeta string vazia quando a env existe mas nao foi preenchida —
// o ?? do JS so cobre null/undefined, entao normalizamos manualmente.
const rawApi = process.env.NEXT_PUBLIC_API_URL ?? '';
const API_URL = (rawApi.trim() || 'http://localhost:4000').replace(/\/$/, '');
const TOKEN_KEY = 'bn_admin_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_KEY, t);
}
export function clearToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  auth?: boolean;
}

export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, signal, auth = true } = opts;
  const url = new URL(`${API_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
  }
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (auth) {
    const t = getToken();
    if (t) headers.authorization = `Bearer ${t}`;
  }
  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      clearToken();
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    throw new ApiError(res.status, data?.message ?? `HTTP ${res.status}`, data);
  }
  return data as T;
}
