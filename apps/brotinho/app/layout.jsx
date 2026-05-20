import './globals.css';

export const metadata = {
  metadataBase: new URL('https://brotinho.app'),
  title: 'brotinho 🌱 — cuidem juntos de um broto · Dia dos Namorados',
  description:
    'Um pet-plantinha pro casal regar, conversar e ver crescer. 3 minutos por dia, juntos. Lança 12 de junho, Dia dos Namorados. Entre na lista de espera.',
  applicationName: 'brotinho',
  authors: [{ name: 'brotinho' }],
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'brotinho',
    locale: 'pt_BR',
    title: 'brotinho 🌱 — cuidem juntos de um broto',
    description: 'Um pet-plantinha pro casal. Lança 12.06, Dia dos Namorados.',
    url: 'https://brotinho.app/',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'brotinho — plantem algo juntos no Dia dos Namorados',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'brotinho 🌱 — cuidem juntos de um broto',
    description: 'Um pet-plantinha pro casal. Lança 12.06.',
    images: ['/og-image.png'],
  },
};

export const viewport = {
  themeColor: '#FFF1DA',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'brotinho',
  url: 'https://brotinho.app/',
  description:
    'Pet-plantinha pro casal cuidar junto. Lança 12 de junho, Dia dos Namorados.',
  inLanguage: 'pt-BR',
};

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <div className="desk-flair df-1">💕</div>
        <div className="desk-flair df-2">💗</div>
        <div className="desk-flair df-3">✿</div>
        <div className="desk-flair df-4">🌱</div>
        <div id="__next-root">{children}</div>
      </body>
    </html>
  );
}
