const HTTP_ERROR_TAG = Symbol.for('app.http-error');

export const isHttpError = (value) =>
  value !== null && typeof value === 'object' && value[HTTP_ERROR_TAG] === true;

export const createHttpError = ({ status, name, message, details }) => {
  const error = new Error(message);
  error.name = name;
  error.status = status;
  error.details = details;
  error[HTTP_ERROR_TAG] = true;
  return error;
};
