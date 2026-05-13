import type { Metadata, Viewport } from 'next';
import { Newsreader, Inter_Tight, JetBrains_Mono } from 'next/font/google';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getChannel } from '@/lib/api';
import { buildBaseMetadata, jsonLd } from '@/lib/seo';
import { organizationLd, websiteLd } from '@/lib/jsonld';
import './globals.css';

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
});
const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter-tight',
  display: 'swap',
});
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0a0e17',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const channel = await getChannel();
  return buildBaseMetadata(channel);
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const channel = await getChannel();
  return (
    <html
      lang={channel.language || 'pt-BR'}
      className={`${newsreader.variable} ${interTight.variable} ${jetbrains.variable}`}
    >
      <head>
        <meta name="msvalidate.01" content="BAAE23D59A15D0951FFCECDF3BE468FA" />
        <link rel="alternate" type="application/rss+xml" title={`${channel.name} · RSS`} href="/feed.xml" />
        <link rel="alternate" type="application/atom+xml" title={`${channel.name} · Atom`} href="/atom.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organizationLd(channel)) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(websiteLd(channel)) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header channel={channel} />
        <main id="main" className="flex-1">{children}</main>
        <Footer channel={channel} />
      </body>
    </html>
  );
}
