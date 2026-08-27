import { sectionForKind } from './taxonomy.js';

/**
 * Monta a URL de um conteúdo a partir da seção dona do seu kind.
 *
 * A regra vive no registro (taxonomy.js), não aqui: a seção declara o próprio
 * slug e o prefixo que deve ser removido do slug do signal.
 *   psalm  + "salmo-91"      → /salmo/91
 *   article + "fe-no-escuro" → /blog/fe-no-escuro
 *
 * Funciona tanto com signalSchema quanto com signalSummarySchema.
 */
export const signalUrl = (signal) => {
  const { kind, slug } = signal;
  const section = sectionForKind(kind);
  const prefix = section.slugPrefix ?? '';
  const rest = prefix && slug.startsWith(prefix) ? slug.slice(prefix.length) : slug;
  return `/${section.slug}/${rest}`;
};

/** URL de um item que ainda está na pauta (roadmap.js), pra montar links futuros. */
export const plannedUrl = (item) => `/${item.section}/${item.slug}`;
