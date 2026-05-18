import { PATHS, PUBLIC_ENDPOINTS } from '../../constants/api.js';
import { LANDING_BRAND, LANDING_TEXT } from '../../constants/landing.js';
import { landingStyles } from './landing.styles.js';

const renderEndpointRow = ({ method, path, description }) =>
  `<div><span class="method">${method}</span><span class="path">${path}</span><span class="desc">${description}</span></div>`;

const renderEndpoints = (endpoints) => endpoints.map(renderEndpointRow).join('');

export const renderLandingHtml = ({ name, version, description, year, nodeVersion }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>${name} · v${version}</title>
<style>${landingStyles}</style>
</head>
<body>
  <div class="wrap">  
    <header>
      <div class="logo">${LANDING_BRAND.LOGO_LETTER}</div>
      <div>
        <h1>${name}</h1>
        <span class="badge">v${version}</span>
      </div>
    </header>
    <p>${description}</p>

    <h2>${LANDING_TEXT.ENDPOINTS_HEADING}</h2>
    <div class="endpoints">
      ${renderEndpoints(PUBLIC_ENDPOINTS)}
    </div>

    <h2>${LANDING_TEXT.STATUS_HEADING}</h2>
    <p>${LANDING_TEXT.HEALTHCHECK_HINT} <a href="${PATHS.HEALTH}"><code>${PATHS.HEALTH}</code></a>.</p>

    <footer>
      <span>© ${year} ${LANDING_BRAND.OWNER} — ${LANDING_BRAND.VISIBILITY}.</span>
      <span>node ${nodeVersion}</span>
    </footer>
  </div>
</body>
</html>`;
