import { compose, EDITORIAL, OUTPUT_DISCIPLINE, PERSONA, SEO_GEO, CLARITY, AUTHORITY, TONE_DEFAULT, ANTI_HYPE, CTA_GUIDELINES } from '../blocks.js';
import { buildBrandProfile } from '../brand.js';
import type {
  AdaptToneInput,
  InjectCtasInput,
  OptimizeSeoInput,
  ReviewArticleInput,
} from '../inputs.js';
import type { PromptDef } from '../types.js';

// ─── 7. REVISAR E MELHORAR UM ARTIGO JÁ GERADO ─────────────────────────────

export const reviewArticlePrompt: PromptDef<ReviewArticleInput> = {
  name: 'review-article',
  category: 'refinement',
  version: '1.0.0',
  description: 'Passe de revisão editorial sobre artigo já redigido. Devolve markdown revisado e lista de issues encontradas.',
  system: compose(
    PERSONA,
    `Tarefa: revisar e melhorar um artigo já redigido. Mantenha a estrutura do markdown (headings, tabelas, listas) intacta, mude apenas o que melhora qualidade.

Foco da revisão:
- Cortar fluff, hedging e frases-elevador.
- Substituir generalidade por especificidade.
- Quebrar frase passiva longa em ativa curta.
- Reforçar autoridade onde a alegação carece de fonte ou ressalva.
- Garantir answer-first em cada seção.
- Tornar parágrafo de abertura punchy.
- Eliminar repetições.

O que NÃO fazer:
- Não acrescente seção nova nem remova seção existente.
- Não invente fato, número ou referência. Se faltar fonte, sugira reconhecer o limite.
- Não mude o sentido do que o autor afirmou. Mantenha a tese.

Saída:
- revisedContent: markdown completo já revisado.
- issues: até 20 itens (severity, category, excerpt antes, problem, suggestion aplicada).
- summary: 2 a 3 linhas resumindo as mudanças principais.`,
    EDITORIAL,
    CLARITY,
    AUTHORITY,
    OUTPUT_DISCIPLINE,
  ),
  user: (input) => {
    const brand = buildBrandProfile(input);
    const focus = input.focus?.length ? input.focus.join(', ') : 'revisão geral';
    const lines: string[] = [];
    lines.push(brand.systemBlock);
    lines.push('');
    lines.push(`Título: ${input.refinedTitle}`);
    lines.push(`Keyword principal: ${input.primaryKeyword}`);
    lines.push(`Foco da revisão: ${focus}`);
    lines.push('');
    lines.push('Conteúdo a revisar (markdown):');
    lines.push('```markdown');
    lines.push(input.content);
    lines.push('```');
    return lines.join('\n');
  },
};

// ─── 8. OTIMIZAR SEO SEM ESTRAGAR A NATURALIDADE ───────────────────────────

export const optimizeSeoPrompt: PromptDef<OptimizeSeoInput> = {
  name: 'optimize-seo',
  category: 'refinement',
  version: '1.0.0',
  description: 'Otimiza um artigo para SEO/GEO sem estragar a fluência. Ajusta headings, primeiro parágrafo, densidade da keyword e listas/tabelas onde fizer sentido.',
  system: compose(
    PERSONA,
    `Tarefa: otimizar o artigo para SEO e GEO sem prejudicar a fluência.

Permitido:
- Reescrever H1/H2/H3 quando ficam mais específicos sem ficar artificiais.
- Acrescentar 1 linha "answer-first" ao início de seção que esteja sem.
- Inserir naturalmente a palavra-chave principal na primeira frase, na primeira seção e em pelo menos um H2.
- Substituir trecho que daria boa tabela/lista numerada por tabela/lista, quando a estrutura comparativa existe.
- Adicionar FAQ ao final se ainda não houver e o tema sustentar.

Proibido:
- Keyword stuffing. Densidade alvo da keyword principal: 0.5% a 1.5% do total de palavras.
- Reescrever a tese ou o ponto de vista.
- Inventar dado, número ou referência.

Saída:
- optimizedContent: markdown otimizado.
- changes: lista curta com cada mudança aplicada (ex: "H2 da seção 2 reescrito para incluir keyword").
- primaryKeywordDensity: densidade resultante (estimativa entre 0 e 1).`,
    SEO_GEO,
    EDITORIAL,
    CLARITY,
    OUTPUT_DISCIPLINE,
  ),
  user: (input) => {
    const brand = buildBrandProfile(input);
    const lines: string[] = [];
    lines.push(brand.systemBlock);
    lines.push('');
    lines.push(`Título: ${input.refinedTitle}`);
    lines.push(`Keyword principal: ${input.primaryKeyword}`);
    if (input.secondaryKeywords?.length) lines.push(`Secundárias: ${input.secondaryKeywords.join(', ')}`);
    lines.push('');
    lines.push('Conteúdo a otimizar (markdown):');
    lines.push('```markdown');
    lines.push(input.content);
    lines.push('```');
    return lines.join('\n');
  },
};

// ─── 9. ADAPTAR AO TOM DA MARCA ────────────────────────────────────────────

export const adaptTonePrompt: PromptDef<AdaptToneInput> = {
  name: 'adapt-tone',
  category: 'refinement',
  version: '1.0.0',
  description: 'Adapta o conteúdo de um artigo ao tom da marca. Mantém estrutura e fatos, ajusta voz, escolha de palavras, ritmo.',
  system: compose(
    PERSONA,
    `Tarefa: adaptar o tom do artigo para a voz da marca.

O que mexer:
- Escolha de palavras (mais direta, menos rebuscada).
- Ritmo das frases (alterna curtas e médias).
- Pessoa verbal (segue a do canal: você, vocês, gente, primeira pessoa do plural).
- Abertura e fechamento de seções (alinha com tom da marca).
- Substitui clichê por afirmação concreta.

O que NÃO mexer:
- Estrutura de headings.
- Fatos, números, dados.
- Tabelas e listas.
- Tese e conclusão.

Saída:
- adaptedContent: markdown adaptado.
- changes: até 15 itens descrevendo as mudanças mais relevantes.`,
    EDITORIAL,
    TONE_DEFAULT,
    CLARITY,
    OUTPUT_DISCIPLINE,
  ),
  user: (input) => {
    const brand = buildBrandProfile(input);
    const lines: string[] = [];
    lines.push(brand.systemBlock);
    if (input.toneOverride) {
      lines.push('');
      lines.push('Override de tom (priorize sobre o default da marca):');
      lines.push(input.toneOverride);
    }
    lines.push('');
    lines.push('Conteúdo a adaptar (markdown):');
    lines.push('```markdown');
    lines.push(input.content);
    lines.push('```');
    return lines.join('\n');
  },
};

// ─── 11. INSERIR CTAs NATURAIS ─────────────────────────────────────────────

export const injectCtasPrompt: PromptDef<InjectCtasInput> = {
  name: 'inject-ctas',
  category: 'refinement',
  version: '1.0.0',
  description: 'Decide pontos do artigo onde CTAs naturais cabem (entre 1 e 3) e gera o texto de cada um.',
  system: compose(
    PERSONA,
    `Tarefa: identificar até 3 pontos do artigo onde inserir CTAs naturais e gerar o texto de cada um.

Regras de inserção:
- Insira CTA somente após o leitor receber valor da seção. Nunca antes.
- 1 a 3 inserções no artigo todo, distribuídas (não empilhe).
- O CTA precisa fazer sentido contextual com a seção em que aparece.
- Cada CTA tem 1 frase, voz ativa, ação concreta + benefício implícito.
- A URL precisa estar entre os ctaTargets fornecidos. Não invente URL.
- Para cada inserção, retorne o início do parágrafo logo APÓS o qual o CTA entra (afterParagraphStart). Use os primeiros 60 a 100 chars do parágrafo para o pipeline localizar.`,
    EDITORIAL,
    ANTI_HYPE,
    CTA_GUIDELINES,
    OUTPUT_DISCIPLINE,
  ),
  user: (input) => {
    const brand = buildBrandProfile(input);
    const count = input.count ?? 2;
    const lines: string[] = [];
    lines.push(brand.systemBlock);
    lines.push('');
    lines.push(`Título: ${input.refinedTitle}`);
    lines.push(`Quantidade alvo: ${count} CTA(s).`);
    lines.push('');
    lines.push('CTA targets disponíveis (use somente esses):');
    input.ctaTargets.forEach((t, i) => {
      lines.push(`${i + 1}. ${t.label} (${t.url})`);
      lines.push(`   benefício: ${t.valueHint}`);
    });
    lines.push('');
    lines.push('Conteúdo (markdown):');
    lines.push('```markdown');
    lines.push(input.content);
    lines.push('```');
    return lines.join('\n');
  },
};
