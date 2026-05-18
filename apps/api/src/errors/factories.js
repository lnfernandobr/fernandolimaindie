import { HTTP_STATUS } from '../constants/http.js';
import { AUTH_ERRORS } from '../constants/auth.js';
import { createHttpError } from './http-error.js';

const ERROR_NAMES = Object.freeze({
  NOT_FOUND: 'NotFoundError',
  BAD_REQUEST: 'BadRequestError',
  UNAUTHORIZED: 'UnauthorizedError',
  CONFLICT: 'ConflictError',
});

const DEFAULT_MESSAGES = Object.freeze({
  NOT_FOUND: 'Not found',
  UNAUTHORIZED: AUTH_ERRORS.UNAUTHORIZED,
});

export const notFound = (message = DEFAULT_MESSAGES.NOT_FOUND) =>
  createHttpError({ status: HTTP_STATUS.NOT_FOUND, name: ERROR_NAMES.NOT_FOUND, message });

export const badRequest = (message, details) =>
  createHttpError({
    status: HTTP_STATUS.BAD_REQUEST,
    name: ERROR_NAMES.BAD_REQUEST,
    message,
    details,
  });

export const unauthorized = (message = DEFAULT_MESSAGES.UNAUTHORIZED) =>
  createHttpError({ status: HTTP_STATUS.UNAUTHORIZED, name: ERROR_NAMES.UNAUTHORIZED, message });

export const conflict = (message) =>
  createHttpError({ status: HTTP_STATUS.CONFLICT, name: ERROR_NAMES.CONFLICT, message });
