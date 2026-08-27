import { siteConfig, absoluteUrl } from '@/lib/site-config.js';
import { INTENT_SLUGS, INTENT_LABELS } from '@/lib/content/intents.js';
import { SECTIONS, CONTENT_SECTIONS } from '@/lib/content/taxonomy.js';

export async function GET() {
  const lines = [
    `# ${siteConfig.name}`,
    '',
    `> ${siteConfig.brandTagline}: ${siteConfig.description}`,
    '',
    `${siteConfig.name} é uma plataforma de conteúdo devocional cristão em português brasileiro. Orações, salmos, versículos, estudos bíblicos e reflexões organizados por seção e por intenção espiritual, publicados diariamente.`,
    '',
    '## Seções principais',
    '',
    `- [Início](${absoluteUrl('/')}): Página principal`,
    // A lista sai do registro de seções: seção nova aparece aqui sozinha.
    ...SECTIONS.map((s) => `- [${s.label}](${absoluteUrl(`/${s.slug}`)}): ${s.navNote}`),
    `- [Mapa do site](${absoluteUrl('/mapa')}): Índice de tudo que existe no site`,
    '',
    '## Intenções disponíveis',
    '',
    ...Object.entries(INTENT_SLUGS).map(
      ([key, slug]) => `- [${INTENT_LABELS[key]}](${absoluteUrl(`/${slug}`)})`,
    ),
    '',
    '## Tipos de conteúdo',
    '',
    ...CONTENT_SECTIONS.map((s) => `- **${s.kind}** (${s.itemLabel.toLowerCase()}): ${s.lead}`),
    '',
    '## Idioma e público',
    '',
    'Conteúdo em português brasileiro (pt-BR). Público: cristãos católicos e evangélicos no Brasil.',
    '',
    '## Política de uso por IA',
    '',
    `Conteúdo disponível para indexação por assistentes de IA e LLMs. Ver ${absoluteUrl('/robots.txt')} para detalhes.`,
    `Conteúdo completo disponível em ${absoluteUrl('/llms-full.txt')}.`,
    '',
    '## Contato',
    '',
    `- E-mail: ${siteConfig.organization.email}`,
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
