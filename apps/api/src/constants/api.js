export const API_VERSION_PREFIX = '/api/v1';

export const PATHS = Object.freeze({
  ROOT: '/',
  HEALTH: '/health',
  AUTH: '/auth',
  AUTH_LOGIN: '/login',
  AUTH_ME: '/me',
  WAITLIST: '/waitlist',
  SIGNALS: '/signals',
  TOPICS: '/topics',
  ENTITIES: '/entities',
  GENERATION: '/generation',
  MEDIA: '/media',
  SLUG_PARAM: '/:slug',
  SIGNAL_RELATED: '/:slug/related',
});

export const GENERATION_PATHS = Object.freeze({
  SEEDS: '/seeds',
  RUN: '/run',
  BATCH: '/batch',
  STATUS: '/status',
  TRIGGER: '/trigger',
});

export const PUBLIC_ENDPOINTS = Object.freeze([
  { method: 'GET', path: PATHS.HEALTH, description: 'status + uptime + version' },
  { method: '·', path: `${API_VERSION_PREFIX}${PATHS.AUTH}`, description: 'login / me' },
  { method: 'POST', path: `${API_VERSION_PREFIX}${PATHS.WAITLIST}`, description: 'join waitlist by phone' },
  { method: '·', path: `${API_VERSION_PREFIX}${PATHS.SIGNALS}`, description: 'list / read signals' },
  { method: '·', path: `${API_VERSION_PREFIX}${PATHS.TOPICS}`, description: 'list / read topics' },
  { method: '·', path: `${API_VERSION_PREFIX}${PATHS.ENTITIES}`, description: 'list / read entities' },
]);

export const ERROR_NAMES = Object.freeze({
  NOT_FOUND: 'NotFound',
  VALIDATION_ERROR: 'ValidationError',
  INTERNAL_SERVER_ERROR: 'InternalServerError',
});

export const GENERIC_MESSAGES = Object.freeze({
  ROUTE_NOT_FOUND: 'Route not found',
  INVALID_INPUT: 'Invalid input',
  UNHANDLED: 'Something went wrong',
});
