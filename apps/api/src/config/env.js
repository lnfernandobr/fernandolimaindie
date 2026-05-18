import dotenv from 'dotenv';
import path from 'node:path';
import { ENV_FILES } from '../constants/env.js';
import { envSchema } from './env.schema.js';

const EMPTY_STRING = '';

const loadDotenvFiles = () => {
  dotenv.config({ path: path.resolve(process.cwd(), ENV_FILES.LOCAL), override: true });
  dotenv.config({ path: path.resolve(process.cwd(), ENV_FILES.DEFAULT) });
};

const stripEmptyValues = (source) =>
  Object.fromEntries(Object.entries(source).filter(([, value]) => value !== EMPTY_STRING));

loadDotenvFiles();

export const env = envSchema.parse(stripEmptyValues(process.env));
