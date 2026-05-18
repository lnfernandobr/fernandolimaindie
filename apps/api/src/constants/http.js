export const HTTP_STATUS = Object.freeze({
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
});

export const HTTP_METHODS = Object.freeze({
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
});

export const HTTP_HEADERS = Object.freeze({
  AUTHORIZATION: 'authorization',
});

export const CONTENT_TYPES = Object.freeze({
  HTML: 'html',
});

export const REQUEST_BODY_LIMIT = '2mb';
