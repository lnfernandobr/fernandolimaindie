import { compose, OUTPUT_DISCIPLINE, PERSONA } from '../blocks.js';
import type {
  AnalyzeSitePromptInput,
  GenerateCategoryInput,
  GenerateTagsInput,
} from '../inputs.js';
import type { PromptDef } from '../types.js';

// ─── ANALISAR SITE (audit editorial/SEO/GEO) ───────────────────────────────

export const analyzeSitePrompt: PromptDef<AnalyzeSitePromptInput> = {
  name: 'analyze-site',
  category: 'audit',
  version: '3.0.0',
  description: 'Insights estratégicos editoriais/SEO/GEO sobre um site (4 a 8 itens). Não repete o que o audit técnico já mostrou.',
  system: compose(
    `Você é analista editorial e SEO/GEO sênior. Avalia sites de nicho com recomendações específicas e acionáveis.

Foque no que não aparece em métricas técnicas:
- Profundidade e originalidade do conteúdo.
- Autoridade percebida (E-E-A-T).
- Lacunas de cobertura no nicho.
- Hierarquia editorial e UX de leitura.
- Oportunidades estratégicas.

Regras:
- Não repita o que o audit técnico já mostrou (presença de title, sitemap, etc).
- Cada insight é específico ao que você viu no HTML, não genérico.
- Severity: high (trava crescimento), medium (melhoria clara), low (refinamento).
- Area: content | structure | authority | opportunity.`,
    OUTPUT_DISCIPLINE,
  ),
  user: (input) => {
    const t = input.technicalSummary;
    const lines: string[] = [];
    lines.push(`Site: ${input.siteUrl} | Canal: ${input.channelName} | Nicho: ${input.niche}`);
    lines.push('');
    lines.push('Audit técnico (já coletado, não repita):');
    lines.push(`- Performance: ${t.performance.score}/100 (${t.performance.loadTimeMs}ms, ${t.performance.htmlSizeKb}KB)`);
    lines.push(`- SEO: ${t.seo.score}/100 (title ${t.seo.titleLength} chars, meta:${t.seo.hasMetaDescription}, canonical:${t.seo.hasCanonical}, og:${t.seo.hasOpenGraph}, h1:${t.seo.hasH1})`);
    lines.push(`- GEO: ${t.geo.score}/100 (jsonLd:${t.geo.jsonLdCount}, llms.txt:${t.geo.hasLlmsTxt}, rss:${t.geo.hasRssFeed}, bots-ai:${t.geo.botsAllowed})`);
    lines.push(`- Discovery: robots:${t.discovery.hasRobotsTxt}, sitemap:${t.discovery.hasSitemap}`);
    lines.push('');
    // 4500 chars equilibra contexto vs custo.
    lines.push('HTML da home:');
    lines.push('```html');
    lines.push(input.htmlSample.slice(0, 4500));
    lines.push('```');
    lines.push('');
    lines.push('Gere 4 a 8 insights estratégicos.');
    return lines.join('\n');
  },
};

// ─── CATEGORIA DO POST ─────────────────────────────────────────────────────

export const generateCategoryPrompt: PromptDef<GenerateCategoryInput> = {
  name: 'generate-category',
  category: 'audit',
  version: '3.0.0',
  description: 'Decide reutilizar categoria existente ou criar nova para o post.',
  system: compose(
    `Você organiza conteúdo editorial em categorias amplas (4 a 8 por canal no total).

Regras:
- Prefira reutilizar categoria existente se for compatível, mesmo com ângulo levemente diferente. Múltiplas categorias com 1 a 2 posts cada poluem a navegação.
- Crie nova só se o tema realmente não couber em nenhuma existente.
- Slug kebab-case, máx 25 chars. Nome curto e claro (1 a 3 palavras).
- Description: 100 a 200 chars descrevendo o tipo de conteúdo da categoria, não o post atual.`,
    OUTPUT_DISCIPLINE,
  ),
  user: (input) => {
    const lines: string[] = [];
    lines.push(`Nicho: ${input.niche}`);
    lines.push(`Título: ${input.title}`);
    lines.push(`Resumo: ${input.excerpt}`);
    lines.push('');
    lines.push('Categorias existentes:');
    if (input.existing.length === 0) {
      lines.push('(nenhuma, pode criar a primeira)');
    } else {
      for (const c of input.existing) lines.push(`- ${c.slug}: ${c.name}`);
    }
    return lines.join('\n');
  },
};

// ─── TAGS ──────────────────────────────────────────────────────────────────

export const generateTagsPrompt: PromptDef<GenerateTagsInput> = {
  name: 'generate-tags',
  category: 'audit',
  version: '3.0.0',
  description: 'Extrai 3 a 6 tags do post para SEO interno e descoberta.',
  system: compose(
    `Tarefa: extrair 3 a 6 tags para SEO interno e descoberta.

Regras:
- kebab-case, sem acentos, sem stopwords ("o", "a", "para").
- Reutilize tags existentes do canal sempre que possível (cluster de conteúdo).
- Não repita o título inteiro como tag.
- Não use plural óbvio se a versão singular já existe (e vice-versa).
- Mistura ideal: 1 a 2 tags amplas + 2 a 3 específicas do post + 1 contextual quando faz sentido.`,
    OUTPUT_DISCIPLINE,
  ),
  user: (input) => {
    const lines: string[] = [];
    lines.push(`Nicho: ${input.niche}`);
    lines.push(`Título: ${input.title}`);
    lines.push(`Resumo: ${input.excerpt}`);
    if (input.contentExcerpt) {
      lines.push('');
      lines.push('Trecho do conteúdo:');
      lines.push(input.contentExcerpt);
    }
    if (input.existingTags?.length) {
      lines.push('');
      // 50 cobre o cluster típico do canal, suficiente pra decidir reuso.
      lines.push(`Tags existentes (reutilize quando fizer sentido): ${input.existingTags.slice(0, 50).join(', ')}`);
    }
    return lines.join('\n');
  },
};
