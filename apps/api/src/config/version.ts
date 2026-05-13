import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Lê uma única vez ao carregar — version + name do package.json local.
const pkgPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
  name: string;
  version: string;
  description?: string;
};

export const API_NAME = pkg.name;
export const API_VERSION = pkg.version;
export const API_DESCRIPTION =
  pkg.description ?? 'Multi-channel automated blog network: API + Admin + Blog template';
