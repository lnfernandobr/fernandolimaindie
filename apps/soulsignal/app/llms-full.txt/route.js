import { siteConfig, absoluteUrl } from '@/lib/site-config.js';
import { listSignals } from '@/lib/content/api.js';
import { keyToSlug, INTENT_LABELS } from '@/lib/content/intents.js';

export async function GET() {
  const lines = [
    `# ${siteConfig.name} — conteúdo completo`,
    '',
    `> ${siteConfig.description}`,
    '',
    `Idioma: pt-BR | URL: ${absoluteUrl('/')}`,
    '',
    '---',
    '',
  ];

  try {
    const allItems = [];
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      const result = await listSignals({ limit: 100, page });
      allItems.push(...result.items);
      hasMore = page < result.pages;
      page++;
    }
    const items = allItems;

    for (const signal of items) {
      const path = `/${keyToSlug(signal.intent)}/${signal.slug}`;
      lines.push(`## ${signal.title}`);
      lines.push('');
      lines.push(
        `URL: ${absoluteUrl(path)} | Tipo: ${signal.kind} | Intenção: ${INTENT_LABELS[signal.intent] ?? signal.intent}`
      );
      lines.push('');
      lines.push(signal.answer);
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  } catch {
    lines.push('_Conteúdo temporariamente indisponível._');
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
