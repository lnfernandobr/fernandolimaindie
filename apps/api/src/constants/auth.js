export const AUTH_SCHEME = 'Bearer';
export const AUTH_HEADER_SEPARATOR = ' ';
export const BCRYPT_ROUNDS = 12;

export const ROLES = Object.freeze({
  ADMIN: 'admin',
});

export const AUTH_ERRORS = Object.freeze({
  INVALID_CREDENTIALS: 'Invalid credentials',
  MISSING_TOKEN: 'Missing bearer token',
  INVALID_TOKEN: 'Invalid token',
  UNAUTHORIZED: 'Unauthorized',
});
