export const SHUTDOWN_SIGNALS = Object.freeze(['SIGINT', 'SIGTERM']);

export const DB_SERVER_SELECTION_TIMEOUT_MS = 8000;

export const CORS_WILDCARD = '*';
export const CORS_ORIGINS_SEPARATOR = ',';

export const NANOSECONDS_PER_MILLISECOND = 1_000_000;

export const SERVICE_NAME = 'fernandolimaindie-api';

export const EXIT_CODES = Object.freeze({
  SUCCESS: 0,
  FAILURE: 1,
});
