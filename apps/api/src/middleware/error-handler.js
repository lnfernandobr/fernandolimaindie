import { ZodError } from 'zod';
import { logger } from '../config/logger.js';
import { ERROR_NAMES, GENERIC_MESSAGES } from '../constants/api.js';
import { HTTP_STATUS } from '../constants/http.js';
import { isHttpError } from '../errors/http-error.js';

const ISSUE_PATH_SEPARATOR = '.';

const toIssue = (issue) => ({
  path: issue.path.join(ISSUE_PATH_SEPARATOR),
  message: issue.message,
});

const sendValidationError = (res, error) => {
  res.status(HTTP_STATUS.BAD_REQUEST).json({
    error: ERROR_NAMES.VALIDATION_ERROR,
    message: GENERIC_MESSAGES.INVALID_INPUT,
    issues: error.issues.map(toIssue),
  });
};

const sendHttpError = (res, error) => {
  res.status(error.status).json({
    error: error.name,
    message: error.message,
    details: error.details,
  });
};

const sendUnhandledError = (res, error) => {
  logger.error({ err: error }, 'unhandled error');
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: ERROR_NAMES.INTERNAL_SERVER_ERROR,
    message: GENERIC_MESSAGES.UNHANDLED,
  });
};

export const errorHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) return sendValidationError(res, error);
  if (isHttpError(error)) return sendHttpError(res, error);
  return sendUnhandledError(res, error);
};
