import type { Metadata } from 'next';
import CiclosCliente from './CiclosCliente';
import { abs, jsonLd } from '@/lib/seo';
import { breadcrumbLd } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'Calculadora de Ciclos de Sono',
  description:
    'Descubra o horário ideal para dormir ou acordar com base em ciclos de 90 minutos. Acorde descansado completando ciclos inteiros — ferramenta gratuita, sem cadastro.',
  alternates: {
    canonical: abs('/ciclos'),
  },
  openGraph: {
    title: 'Calculadora de Ciclos de Sono',
    description:
      'Saiba a hora exata de dormir (ou acordar) para completar ciclos inteiros e acordar naturalmente descansado.',
    url: abs('/ciclos'),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Ciclos de Sono',
    description:
      'Saiba a hora exata de dormir (ou acordar) para completar ciclos inteiros e acordar naturalmente descansado.',
  },
  robots: { index: true, follow: true },
};

export default function CiclosPage() {
  const ld = [
    breadcrumbLd([
      { name: 'Início', url: abs('/') },
      { name: 'Calculadora de Ciclos de Sono', url: abs('/ciclos') },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Calculadora de Ciclos de Sono',
      description:
        'Calcule o horário ideal de dormir ou acordar com base em ciclos de 90 minutos.',
      url: abs('/ciclos'),
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
      <CiclosCliente />
    </>
  );
}
