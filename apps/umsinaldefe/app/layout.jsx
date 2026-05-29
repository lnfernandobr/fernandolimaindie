import Script from 'next/script';
import './globals.css';
import { siteConfig } from '../lib/site-config.js';
import { buildMetadata } from '../lib/seo/metadata.js';
import {
  organizationLd,
  websiteLd,
  ldGraph,
  jsonLdScript,
} from '../lib/seo/jsonld.js';

export const metadata = {
  ...buildMetadata({}),
  title: {
    default: siteConfig.defaultTitle,
    template: siteConfig.titleTemplate,
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport = {
  themeColor: '#FBF6EE',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const rootGraph = ldGraph(organizationLd(), websiteLd());

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;700&display=swap"
        />
        <script {...jsonLdScript(rootGraph)} />
      </head>
      <body>
        <header className="site">
          <a className="brand" href="/">
            <span className="flame">✦</span> Um Sinal de Fé
          </a>
          <nav aria-label="principal" style={{ fontSize: 14 }}>
            <a href="/devocional" style={{ marginRight: 16 }}>devocional</a>
            <a href="/salmo" style={{ marginRight: 16 }}>salmos</a>
            <a href="/oracao">orações</a>
          </nav>
        </header>
        {children}
        <footer className="site">
          <p style={{ margin: 0 }}>
            Um Sinal de Fé · {siteConfig.brandTagline} · pt-BR
          </p>
        </footer>

        <Script id="sw-register" strategy="afterInteractive">
          {`if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{})`}
        </Script>

        {siteConfig.adsense.client ? (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteConfig.adsense.client}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        ) : null}

        {siteConfig.analytics.gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.analytics.gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${siteConfig.analytics.gaId}', { anonymize_ip: true, send_page_view: true });
              `}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
