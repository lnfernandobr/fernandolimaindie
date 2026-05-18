import { logger } from '../config/logger.js';
import { NANOSECONDS_PER_MILLISECOND } from '../constants/server.js';

const FINISH_EVENT = 'finish';
const LOG_MESSAGE = 'http';

const elapsedMs = (startNanos) =>
  Math.round(Number(process.hrtime.bigint() - startNanos) / NANOSECONDS_PER_MILLISECOND);

export const requestLog = (req, res, next) => {
  const startNanos = process.hrtime.bigint();
  res.on(FINISH_EVENT, () => {
    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        durationMs: elapsedMs(startNanos),
      },
      LOG_MESSAGE,
    );
  });
  next();
};
