import { getApiInfo } from '../../config/package-info.js';
import { renderLandingHtml } from './landing.template.js';

const currentYear = () => new Date().getFullYear();

export const renderLandingPage = () => {
  const { name, version, description } = getApiInfo();
  return renderLandingHtml({
    name,
    version,
    description,
    year: currentYear(),
    nodeVersion: process.version,
  });
};
