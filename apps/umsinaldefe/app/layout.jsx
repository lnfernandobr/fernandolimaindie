import Script from 'next/script';
import { Fraunces, Source_Serif_4 } from 'next/font/google';
import './globals.css';
import { siteConfig } from '../lib/site-config.js';
import { buildMetadata } from '../lib/seo/metadata.js';
import { organizationLd, websiteLd, ldGraph, jsonLdScript } from '../lib/seo/jsonld.js';
import { SiteNav } from '../components/SiteNav.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';

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
  themeColor: '#FAF8F5',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

// Duas famílias, não três: Fraunces nos títulos, Source Serif no texto e na
// interface. Menos bytes na rede e uma voz tipográfica só.
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display-nf',
  display: 'swap',
});
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif-nf',
  display: 'swap',
});

const rootGraph = ldGraph(organizationLd(), websiteLd());

/* Inline script applied before first paint to avoid theme flash */
const themeScript = `(function(){try{var t=localStorage.getItem("usdf-theme");if(t==="night"||t==="day")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      data-theme="day"
      suppressHydrationWarning
      className={`${fraunces.variable} ${sourceSerif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script {...jsonLdScript(rootGraph)} />
      </head>
      <body>
        <SiteNav />
        {children}
        <SiteFooter />

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
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${siteConfig.analytics.gaId}',{anonymize_ip:true,send_page_view:true});`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
