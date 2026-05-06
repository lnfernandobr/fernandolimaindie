import { compose, EDITORIAL, OUTPUT_DISCIPLINE, PERSONA, SEO_GEO, CLARITY, AUTHORITY, TONE_DEFAULT } from '../blocks.js';
import { buildBrandProfile } from '../brand.js';
import type {
  BrainstormTopicsInput,
  OutlineArticleInput,
  SelectTopicInput,
  WriteArticleInput,
} from '../inputs.js';
import type { PromptDef } from '../types.js';

// ─── 5. PAUTA DE BLOG COM FOCO EM SEO ──────────────────────────────────────

export const brainstormTopicsPrompt: PromptDef<BrainstormTopicsInput> = {
  name: 'brainstorm-topics',
  category: 'editorial',
  version: '3.0.0',
  description: 'Gera 8 a 10 candidatos de pauta diversificados em ângulo, intenção e nível, com foco em SEO long-tail e gap de cobertura.',
  system: compose(
    PERSONA,
    `Tarefa: gerar candidatos de pauta diversificados, considerando o que já foi publicado e o que o público busca.

Critérios:
- Cada candidato com ângulo único (formato, recorte, ponto de vista). Sem 5 variações da mesma pergunta.
- Diversifique intenção: informational, comparison, how-to, opinion, troubleshooting, review.
- Diversifique nível: alguns para iniciante, outros intermediário ou avançado.
- Long-tail: tema específico (3 a 5 palavras) ranqueia mais fácil que termo genérico.
- Rejeite tema que repete slug recente ou ângulo de slug recente.
- Para cada candidato, declare o gap que preenche e a intenção primária de busca.`,
    OUTPUT_DISCIPLINE,
  ),
  user: (input) => {
    const brand = buildBrandProfile(input);
    const lines: string[] = [];
    lines.push(brand.systemBlock);
    lines.push('');
    lines.push(`Ano corrente: ${new Date().getFullYear()}`);
    if (input.existingCategories?.length) {
      lines.push('');
      lines.push('Categorias existentes (balanceie a cobertura):');
      for (const c of input.existingCategories) lines.push(`- ${c.name} (${c.slug})`);
    }
    if (input.recentSlugs?.length) {
      lines.push('');
      lines.push('Slugs recentes (não repita ângulo):');
      // 30 slugs cobre ~2 meses de daily. Mais que isso é desperdício de tokens.
      for (const s of input.recentSlugs.slice(0, 30)) lines.push(`- ${s}`);
    }
    lines.push('');
    lines.push('Gere 8 a 10 candidatos diversificados.');
    return lines.join('\n');
  },
};

// ─── Selecionar pauta do dia ───────────────────────────────────────────────

export const selectTopicPrompt: PromptDef<SelectTopicInput> = {
  name: 'select-topic',
  category: 'editorial',
  version: '3.0.0',
  description: 'Escolhe a pauta do dia entre N candidatos, refinando o título.',
  system: compose(
    PERSONA,
    `Tarefa: escolher a pauta do dia entre os candidatos.

Critérios em ordem de prioridade:
1. Gap de cobertura. Prefira tema que cobre lacuna real do canal.
2. Intenção de busca. How-to e comparison têm alta intenção. Opinião gera engajamento mas menos tráfego.
3. Utilidade. Leitor sai com algo aplicável imediatamente.
4. Sem repetição. Rejeite candidato que repete ângulo de slug recente.
5. Balanceamento. Se o canal só tem how-tos recentes, varie o formato.

Decida um. Sem empate. Justifique citando os critérios usados.`,
    OUTPUT_DISCIPLINE,
  ),
  user: (input) => {
    const brand = buildBrandProfile(input);
    const lines: string[] = [];
    lines.push(brand.systemBlock);
    lines.push('');
    lines.push('Candidatos:');
    input.candidates.forEach((c, i) => {
      lines.push(`#${i + 1}. ${c.workingTitle}`);
      lines.push(`   intent: ${c.intent} | format: ${c.format} | level: ${c.audienceLevel}`);
      lines.push(`   ângulo: ${c.angle}`);
      lines.push(`   keyword: ${c.primaryKeyword}`);
      lines.push(`   gap: ${c.gapFilled}`);
    });
    if (input.recentSlugs?.length) {
      lines.push('');
      lines.push('Slugs recentes (detectar overlap):');
      for (const s of input.recentSlugs.slice(0, 30)) lines.push(`- ${s}`);
    }
    if (input.recentFormats && Object.keys(input.recentFormats).length) {
      lines.push('');
      lines.push('Distribuição recente de formatos:');
      for (const [f, n] of Object.entries(input.recentFormats)) lines.push(`- ${f}: ${n}`);
    }
    return lines.join('\n');
  },
};

// ─── 6. OUTLINE ────────────────────────────────────────────────────────────

export const outlineArticlePrompt: PromptDef<OutlineArticleInput> = {
  name: 'outline-article',
  category: 'editorial',
  version: '3.0.0',
  description: 'Define a estrutura do artigo (hook, H2s, must-include, FAQ, alvo de palavras) antes da redação.',
  system: compose(
    PERSONA,
    `Tarefa: definir a estrutura do artigo antes da redação. Outline bom = artigo bom.

Regras:
- H2s na ordem em que aparecem. Cada H2 entrega uma promessa concreta de valor.
- Para cada H2, declare o que precisa estar presente: dados, exemplos, comparações, números.
- Pelo menos uma tabela ou lista numerada se o tema permitir (ajuda em featured snippet e citação por LLMs).
- FAQ ao final com 3 a 5 perguntas reais que o leitor faria depois de ler.
- Hook: tese forte ou número/dado surpreendente. Sem "neste artigo vamos abordar".`,
    EDITORIAL,
    SEO_GEO,
    AUTHORITY,
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
    lines.push(`Intent: ${input.intent} | Format: ${input.format} | Level: ${input.audienceLevel}`);
    lines.push('');
    lines.push('Crie o outline detalhado.');
    return lines.join('\n');
  },
};

// ─── 4. POST COMPLETO (executa o outline em markdown editorial) ───────────

export const writeArticlePrompt: PromptDef<WriteArticleInput> = {
  name: 'write-article',
  category: 'editorial',
  version: '3.0.0',
  description: 'Executa o outline produzindo o post completo em markdown editorial. Esse é o prompt principal de redação.',
  system: compose(
    PERSONA,
    `Tarefa: executar o outline com qualidade alta. Não decida estrutura (já está decidida) nem edite (vem depois). Escreva markdown que cumpre o que cada seção promete.

Execução:
- Siga o outline exatamente. Cada h2 vira ##. Cada h3 vira ###. Não adicione nem remova seções.
- Cada seção começa com a frase answer-first do outline (pode reescrever pra fluir, mantenha a essência), depois aprofunda.
- Cubra todos os "mustInclude" da seção. Se faltar, o artigo fica raso.
- useTable=true gera tabela markdown real. useNumberedList=true gera lista numerada com passos concretos.
- Tom: especialista falando com leigo informado. Direto, sem condescender.
- Comprimento: ±15% do wordCountTarget. Não enche linguiça.
- FAQ: 2 a 4 frases por resposta, específicas.
- Markdown permitido: # ## ### **bold** *italic* listas tabelas \`code\` > blockquote. Nada além.
- Nunca insira links no texto (a UI insere depois).
- Nunca use travessão (em-dash). Use ponto, vírgula ou parênteses.`,
    EDITORIAL,
    SEO_GEO,
    CLARITY,
    AUTHORITY,
    TONE_DEFAULT,
    OUTPUT_DISCIPLINE,
  ),
  user: (input) => {
    const brand = buildBrandProfile(input);
    const lines: string[] = [];
    lines.push(brand.systemBlock);
    lines.push('');
    lines.push(`Título: # ${input.refinedTitle}`);
    lines.push(`Keyword principal: ${input.primaryKeyword}`);
    if (input.secondaryKeywords?.length) lines.push(`Secundárias: ${input.secondaryKeywords.join(', ')}`);
    lines.push(`Meta de palavras: ~${input.wordCountTarget}`);
    lines.push('');
    lines.push(`Hook: ${input.hook}`);
    lines.push('');
    lines.push('Outline a executar:');
    input.sections.forEach((s, i) => {
      lines.push(`${i + 1}. ## ${s.h2}`);
      lines.push(`   answer-first: ${s.answerFirst}`);
      lines.push(`   incluir: ${s.mustInclude.join('; ')}`);
      if (s.h3s?.length) lines.push(`   subseções: ${s.h3s.join(' / ')}`);
      if (s.useTable) lines.push(`   atenção: precisa de tabela markdown real`);
      if (s.useNumberedList) lines.push(`   atenção: precisa de lista numerada com passos`);
    });
    lines.push('');
    lines.push('FAQ:');
    input.faq.forEach((q) => {
      lines.push(`- Q: ${q.question}`);
      lines.push(`  hint: ${q.answerHint}`);
    });
    return lines.join('\n');
  },
};
