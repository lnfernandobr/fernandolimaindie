import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'signals');
const PUBLISHED = 'published';

let cache = null;

/**
 * Todos os posts vêm de apps/umsinaldefe/content/signals/*.json (um arquivo
 * por post, exportado da antiga API). Lido uma vez por processo e cacheado:
 * build estático e servidor de produção não recarregam disco em toda request.
 */
const loadAll = () => {
  if (cache) return cache;
  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.json'));
  cache = files.map((f) => JSON.parse(readFileSync(path.join(CONTENT_DIR, f), 'utf8')));
  return cache;
};

export const getPublishedSignals = () => loadAll().filter((s) => s.status === PUBLISHED);
