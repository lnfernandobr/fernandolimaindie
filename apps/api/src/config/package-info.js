import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANDING_FALLBACK_DESCRIPTION } from '../constants/landing.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const packageJsonPath = resolve(currentDir, '../../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

const apiInfo = Object.freeze({
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description ?? LANDING_FALLBACK_DESCRIPTION,
});

export const getApiInfo = () => apiInfo;
