import { getApiInfo } from '../../config/package-info.js';
import { HTTP_STATUS } from '../../constants/http.js';

const HEALTH_OK = 'ok';

export const handleHealth = (_req, res) => {
  const { name, version } = getApiInfo();
  res.status(HTTP_STATUS.OK).json({
    status: HEALTH_OK,
    name,
    version,
    uptime: process.uptime(),
  });
};
