import { absoluteUrl } from '../lib/site-config.js';
import { listSignals } from '../lib/content/api.js';
import { signalUrl } from '../lib/content/signal-url.js';
import { INTENT_SLUGS } from '../lib/content/intents.js';
import { SECTIONS } from '../lib/content/taxonomy.js';

export const revalidate = 86400;

/** Kinds que a seção agrega (principal + extras). */
const kindsOf = (section) => [section.kind, ...(section.extraKinds ?? [])].filter(Boolean);

export default async function sitemap() {
  const now = new Date();

  // Todo o conteúdo publicado vem dos arquivos em content/signals/.
  let allSignals = [];
  try {
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      const result = await listSignals({ limit: 100, page });
      allSignals.push(...result.items);
      hasMore = page < result.pages;
      page++;
    }
  } catch {
    // Sem conteúdo no build: sitemap fica só com a home e as intenções
  }

  const publishedKinds = new Set(allSignals.map((s) => s.kind));

  // Hub sem nenhum conteúdo fica de fora: era exatamente esse tipo de página
  // vazia que o Search Console marcava como "não indexada". Ele entra sozinho
  // no sitemap assim que o primeiro conteúdo da seção for publicado.
  const sectionEntries = SECTIONS.filter(
    (section) => !section.kind || kindsOf(section).some((k) => publishedKinds.has(k)),
  ).map((section) => ({
    url: absoluteUrl(`/${section.slug}`),
    lastModified: now,
    changeFrequency: section.changeFrequency,
    priority: section.priority,
  }));

  const intentEntries = Object.values(INTENT_SLUGS).map((intent) => ({
    url: absoluteUrl(`/${intent}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const signalEntries = allSignals.map((s) => ({
    url: absoluteUrl(signalUrl(s)),
    lastModified: s.publishedAt ?? now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    ...sectionEntries,
    ...intentEntries,
    { url: absoluteUrl('/mapa'), lastModified: now, changeFrequency: 'weekly', priority: 0.4 },
    ...signalEntries,
  ];
}
