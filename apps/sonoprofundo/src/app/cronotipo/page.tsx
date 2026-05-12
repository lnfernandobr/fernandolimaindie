import type { Metadata } from 'next';
import CronotipoCliente from './CronotipoCliente';
import { abs, jsonLd } from '@/lib/seo';
import { breadcrumbLd } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'Calculadora de Cronotipo do Sono',
  description:
    'Descubra se você é matutino, vespertino ou intermediário com perguntas baseadas no cronotipo circadiano. Saiba seu horário ideal de dormir, acordar e seu pico de produtividade.',
  alternates: {
    canonical: abs('/cronotipo'),
  },
  openGraph: {
    title: 'Calculadora de Cronotipo do Sono',
    description:
      'Cotovia ou coruja? Descubra seu cronotipo circadiano e os horários ideais para seu ritmo natural.',
    url: abs('/cronotipo'),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Cronotipo do Sono',
    description:
      'Cotovia ou coruja? Descubra seu cronotipo circadiano e os horários ideais para seu ritmo natural.',
  },
  robots: { index: true, follow: true },
};

export default function CronotipoPage() {
  const ld = [
    breadcrumbLd([
      { name: 'Início', url: abs('/') },
      { name: 'Calculadora de Cronotipo', url: abs('/cronotipo') },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Calculadora de Cronotipo do Sono',
      description:
        'Descubra seu cronotipo circadiano — matutino, intermediário ou vespertino — com base em perguntas sobre seus hábitos naturais de sono.',
      url: abs('/cronotipo'),
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
      <CronotipoCliente />
    </>
  );
}
