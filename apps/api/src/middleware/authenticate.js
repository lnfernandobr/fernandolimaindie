import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AUTH_ERRORS, AUTH_HEADER_SEPARATOR, AUTH_SCHEME } from '../constants/auth.js';
import { HTTP_HEADERS } from '../constants/http.js';
import { unauthorized } from '../errors/factories.js';

const EMPTY_HEADER = '';

const extractBearerToken = (headerValue) => {
  if (!headerValue) return null;
  const [scheme, token] = headerValue.split(AUTH_HEADER_SEPARATOR);
  if (scheme !== AUTH_SCHEME || !token) return null;
  return token;
};

const decodeToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw unauthorized(AUTH_ERRORS.INVALID_TOKEN);
  }
};

export const requireAuth = (req, _res, next) => {
  const headerValue = req.header(HTTP_HEADERS.AUTHORIZATION) ?? EMPTY_HEADER;
  const token = extractBearerToken(headerValue);
  if (!token) throw unauthorized(AUTH_ERRORS.MISSING_TOKEN);
  req.user = decodeToken(token);
  next();
};
