import { minutesToWordTarget } from '@bn/shared';
import { compose, EDITORIAL, OUTPUT_DISCIPLINE, PERSONA, SEO_GEO, CLARITY, AUTHORITY, NATURAL_VOICE, TONE_DEFAULT } from '../blocks.js';
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
  version: '4.0.0',
  description: 'Gera 8 a 10 candidatos diversificados em "buckets temáticos" (clínico, lifestyle, cultural, curiosidade, narrativa) — não só conteúdo técnico.',
  system: compose(
    PERSONA,
    `Tarefa: gerar candidatos de pauta diversificados COBRINDO O ESPECTRO INTEIRO do tema, não apenas o lado clínico/técnico.

REGRA CRÍTICA — distribuição por buckets temáticos. Os 8 a 10 candidatos DEVEM se distribuir entre:
1. **Clínico/Saúde** (máximo 30% dos candidatos): doses, distúrbios, comparativo clínico, troubleshooting médico.
2. **Prático/Lifestyle** (mínimo 30%): hábitos, rotina, escolhas de produto comum (travesseiro, colchão, fones), ergonomia, ambiente do quarto.
3. **Cultural/Curiosidade** (mínimo 20%): história, antropologia, ciência leve curiosa, comportamento, animais, mitos populares.
4. **Pessoal/Narrativo** (até 20%): perfil, depoimento estruturado, opinião editorial, ensaio de observação.

Se o canal só tem posts clínicos recentes, FORCE a maior parte dos candidatos para os buckets 2-3-4. Repetir o lado clínico é o erro mais comum.

Critérios adicionais:
- Cada candidato com ângulo único. Sem 5 variações da mesma pergunta clínica.
- Diversifique intenção: informational, comparison, how-to, opinion, troubleshooting, review.
- Diversifique nível: pelo menos metade DEVE ser beginner. Avançado só se há gap real.
- Long-tail (3 a 5 palavras) ranqueia mais fácil que termo genérico.
- Rejeite tema que repete slug recente ou ângulo de slug recente.
- Títulos de trabalho preferem ser conversacionais ("Por que a gente acorda 3h da manhã sem motivo?") em vez de clínicos ("Despertares noturnos: causas e tratamento").
- Para cada candidato, declare gap que preenche e intenção de busca.`,
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
    if (input.targetReadingMinutes) {
      const targetWords = minutesToWordTarget(input.targetReadingMinutes);
      const maxWords = Math.round(targetWords * 1.1);
      lines.push('');
      lines.push(
        `RESTRIÇÃO DURA de comprimento: ${input.targetReadingMinutes} min de leitura = ${targetWords} palavras (NUNCA passe de ${maxWords}). wordCountTarget DEVE estar entre ${Math.round(targetWords * 0.9)} e ${targetWords}. Dimensione H2s e FAQ pra caber: artigo curto (≤5min) tem 3-4 H2s e FAQ de 3 perguntas; médio (6-10min) tem 4-6 H2s e FAQ de 3-5; longo (>10min) tem 5-7 H2s e FAQ de 4-5. Cortar conteúdo é melhor que estourar.`,
      );
    }
    lines.push('');
    lines.push('Crie o outline detalhado.');
    return lines.join('\n');
  },
};

// ─── 4. POST COMPLETO (executa o outline em markdown editorial) ───────────

export const writeArticlePrompt: PromptDef<WriteArticleInput> = {
  name: 'write-article',
  category: 'editorial',
  version: '4.0.0',
  description: 'Executa o outline produzindo o post completo em markdown editorial. Prompt principal de redação — voz natural e conversacional priorizada.',
  system: compose(
    PERSONA,
    `Tarefa: executar o outline com voz natural e conversacional. Texto que parece escrito por humano experiente, não por IA citando estudos. Escreva markdown que cumpre o que cada seção promete SEM virar paper acadêmico.

Execução:
- Siga o outline exatamente. Cada h2 vira ##. Cada h3 vira ###. Não adicione nem remova seções.
- Cada seção começa com a frase answer-first do outline (pode reescrever pra fluir, mantenha a essência), depois aprofunda em prosa fluida.
- Cubra os "mustInclude" da seção, mas integrados em prosa — não em listão de bullets.
- useTable=true gera tabela markdown real. useNumberedList=true gera lista numerada com passos concretos. Sem essas flags, FAVOREÇA prosa em vez de bullets.
- Tom: amigo informado conversando, NÃO médico em consulta. NÃO professor em aula expositiva. Comece seções com observação, pergunta, ou cena concreta sempre que possível.
- COMPRIMENTO É RESTRIÇÃO DURA: total entre 90% e 110% de wordCountTarget. Conte palavras antes de fechar. Excedeu? Corte adjetivos, redundâncias, citações que dá pra omitir, fechamento óbvio. Faltou? Aprofunde com analogia ou exemplo concreto, NUNCA encha linguiça.
- FAQ: 1 a 3 frases por resposta. Direto e específico. Nada de explicação longa.
- Citações de estudo: máximo 2 a 3 no artigo todo, e SÓ quando alegação clínica forte exige. Lifestyle/curiosidade/opinião = ZERO citação.
- Markdown permitido: # ## ### **bold** *italic* listas tabelas \`code\` > blockquote. Nada além.
- Nunca insira links no texto (a UI insere depois).
- Nunca use travessão (em-dash). Use ponto, vírgula ou parênteses.
- Tudo em pt-BR contemporâneo conversacional.`,
    NATURAL_VOICE,
    TONE_DEFAULT,
    EDITORIAL,
    CLARITY,
    SEO_GEO,
    AUTHORITY,
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
