import { siteConfig, absoluteUrl } from '@/lib/site-config.js';
import { INTENT_SLUGS, INTENT_LABELS } from '@/lib/content/intents.js';

export async function GET() {
  const lines = [
    `# ${siteConfig.name}`,
    '',
    `> ${siteConfig.brandTagline} — ${siteConfig.description}`,
    '',
    `${siteConfig.name} é uma plataforma de conteúdo devocional cristão em português brasileiro. Orações, salmos, reflexões e versículos organizados por intenção espiritual, publicados diariamente.`,
    '',
    '## Seções principais',
    '',
    `- [Início](${absoluteUrl('/')}): Página principal`,
    `- [Devocional](${absoluteUrl('/devocional')}): Devocional diário`,
    `- [Salmos](${absoluteUrl('/salmo')}): Orações baseadas nos Salmos`,
    `- [Orações](${absoluteUrl('/oracao')}): Orações para diversas intenções`,
    '',
    '## Intenções disponíveis',
    '',
    ...Object.entries(INTENT_SLUGS).map(
      ([key, slug]) =>
        `- [${INTENT_LABELS[key]}](${absoluteUrl(`/${slug}`)})`
    ),
    '',
    '## Tipos de conteúdo',
    '',
    '- **prayer** (oração): Orações tradicionais e contemporâneas',
    '- **psalm** (salmo): Orações baseadas nos Salmos bíblicos',
    '- **reflection** (reflexão): Reflexões espirituais curtas',
    '- **verse** (versículo): Versículos bíblicos comentados',
    '- **devotional** (devocional): Devocionais diários',
    '- **novena** (novena): Novenas aos santos e invocações',
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
    `## Contato`,
    '',
    `- E-mail: ${siteConfig.organization.email}`,
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
