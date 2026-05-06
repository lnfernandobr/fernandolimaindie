import { compose, OUTPUT_DISCIPLINE, PERSONA, SEO_GEO, ANTI_HYPE } from '../blocks.js';
import { buildBrandProfile } from '../brand.js';
import type { GenerateMetadataInput } from '../inputs.js';
import type { PromptDef } from '../types.js';

// ─── 10. METADATA: TITLE, META, SLUG, EXCERPT, KEYWORDS, TAGS ──────────────

export const generateMetadataPrompt: PromptDef<GenerateMetadataInput> = {
  name: 'generate-metadata',
  category: 'meta',
  version: '3.0.0',
  description: 'Gera metaTitle, metaDescription, slug, keywords, suggestedTags e summary (excerpt) do post finalizado.',
  system: compose(
    PERSONA,
    `Tarefa: gerar metadata SEO/GEO do artigo finalizado.

Prioridades por campo:
- metaTitle: 50-60 chars, keyword principal nos primeiros 30, gancho sem clickbait.
- metaDescription: 140-160 chars com benefício concreto. Sem "saiba mais" ou "neste artigo".
- slug: kebab-case, 3 a 7 palavras, sem stopwords ("o", "a", "de", "para") sempre que removê-las não tira o sentido.
- keywords: 5 a 8 termos. Inclui primary, secondary e variações long-tail. Sem repetição.
- suggestedTags: 3 a 6 tags em kebab-case. Mais específicas que keywords.
- summary (excerpt): 2 a 3 frases para preview de cards e redes sociais. Vai como excerpt no DB.

Anti-clickbait estrito. Confiabilidade vence CTR de curto prazo.`,
    SEO_GEO,
    ANTI_HYPE,
    OUTPUT_DISCIPLINE,
  ),
  user: (input) => {
    const brand = buildBrandProfile(input);
    const lines: string[] = [];
    lines.push(brand.systemBlock);
    lines.push('');
    lines.push(`Título: ${input.title}`);
    lines.push(`Keyword principal: ${input.primaryKeyword}`);
    if (input.secondaryKeywords?.length) lines.push(`Secundárias: ${input.secondaryKeywords.join(', ')}`);
    if (input.excerpt) {
      lines.push('');
      lines.push(`Resumo já existente: ${input.excerpt}`);
    }
    lines.push('');
    // 2000 chars cobrem ~500 tokens, suficiente pra capturar tom e tese.
    lines.push('Trecho do conteúdo (primeiras seções):');
    lines.push(input.content.slice(0, 2000));
    return lines.join('\n');
  },
};
