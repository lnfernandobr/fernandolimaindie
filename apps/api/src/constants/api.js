export const API_VERSION_PREFIX = '/api/v1';

export const PATHS = Object.freeze({
  ROOT: '/',
  HEALTH: '/health',
  AUTH: '/auth',
  AUTH_LOGIN: '/login',
  AUTH_ME: '/me',
});

export const PUBLIC_ENDPOINTS = Object.freeze([
  { method: 'GET', path: PATHS.HEALTH, description: 'status + uptime + version' },
  { method: '·', path: `${API_VERSION_PREFIX}${PATHS.AUTH}`, description: 'login / me' },
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
