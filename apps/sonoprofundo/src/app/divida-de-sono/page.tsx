import type { Metadata } from 'next';
import DividaCliente from './DividaCliente';
import { abs, jsonLd } from '@/lib/seo';
import { breadcrumbLd } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'Calculadora de Dívida de Sono',
  description:
    'Calcule quantas horas de sono você acumulou como dívida esta semana e quanto tempo precisa para se recuperar. Veja dia a dia onde seu sono foi comprometido.',
  alternates: {
    canonical: abs('/divida-de-sono'),
  },
  openGraph: {
    title: 'Calculadora de Dívida de Sono',
    description:
      'Quanto sono você está devendo? Calcule sua dívida acumulada na semana e o tempo de recuperação.',
    url: abs('/divida-de-sono'),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Dívida de Sono',
    description:
      'Quanto sono você está devendo? Calcule sua dívida acumulada na semana e o tempo de recuperação.',
  },
  robots: { index: true, follow: true },
};

export default function DividaPage() {
  const ld = [
    breadcrumbLd([
      { name: 'Início', url: abs('/') },
      { name: 'Calculadora de Dívida de Sono', url: abs('/divida-de-sono') },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Calculadora de Dívida de Sono',
      description:
        'Informe quantas horas dormiu em cada dia da semana e veja sua dívida acumulada e o tempo para recuperação.',
      url: abs('/divida-de-sono'),
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
      <DividaCliente />
    </>
  );
}
