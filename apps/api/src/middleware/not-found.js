import { ERROR_NAMES, GENERIC_MESSAGES } from '../constants/api.js';
import { HTTP_STATUS } from '../constants/http.js';

export const notFoundHandler = (_req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    error: ERROR_NAMES.NOT_FOUND,
    message: GENERIC_MESSAGES.ROUTE_NOT_FOUND,
  });
};
