import type { Metadata } from 'next';
import ApneiaCliente from './ApneiaCliente';
import { abs, jsonLd } from '@/lib/seo';
import { breadcrumbLd } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'Triagem de Apneia do Sono — STOP-BANG',
  description:
    'Avalie seu risco de apneia obstrutiva do sono com o questionário STOP-BANG validado clinicamente. 8 perguntas, resultado imediato e orientação sobre os próximos passos.',
  alternates: {
    canonical: abs('/apneia'),
  },
  openGraph: {
    title: 'Triagem de Apneia do Sono — STOP-BANG',
    description:
      'Você tem risco de apneia do sono? Responda 8 perguntas do questionário STOP-BANG e descubra agora.',
    url: abs('/apneia'),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Triagem de Apneia do Sono — STOP-BANG',
    description:
      'Você tem risco de apneia do sono? Responda 8 perguntas do questionário STOP-BANG e descubra agora.',
  },
  robots: { index: true, follow: true },
};

export default function ApneiaPage() {
  const ld = [
    breadcrumbLd([
      { name: 'Início', url: abs('/') },
      { name: 'Triagem de Apneia do Sono', url: abs('/apneia') },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Triagem de Apneia do Sono — STOP-BANG',
      description:
        'Questionário STOP-BANG para triagem de risco de apneia obstrutiva do sono. 8 perguntas com resultado imediato.',
      url: abs('/apneia'),
      applicationCategory: 'HealthApplication',
      inLanguage: 'pt-BR',
      isAccessibleForFree: true,
      operatingSystem: 'Web',
    },
  ];

  return (
    <>
      {ld.map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(data) }}
        />
      ))}
      <ApneiaCliente />
    </>
  );
}
