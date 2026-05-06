/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  PROMPTS — arquivo central da camada de IA.
 *
 *  Toda skill encontra aqui o prompt que usa: system + user(input). Esse é
 *  o ÚNICO lugar onde prompts vivem — providers/skills nunca declaram
 *  string de prompt inline.
 *
 *  ARQUITETURA DE TOKENS
 *  ─────────────────────
 *  1. Composição via BUILDING_BLOCKS — PERSONA, EDITORIAL, SEO_GEO,
 *     OUTPUT_DISCIPLINE são declarados uma vez e reutilizados. Cada `system`
 *     compõe só os blocos relevantes para a skill.
 *  2. SEM schema no prompt — usamos structured output nativo (Anthropic
 *     tool input_schema / OpenAI Structured Outputs strict). O schema vive
 *     em `ai/schemas.ts` e é injetado pelo provider, não pelo prompt.
 *  3. Cache-friendly — blocos estáveis primeiro, instrução específica
 *     depois. Anthropic cacheia o `system` quando passa de ~2k chars
 *     (ClaudeProvider seta cache_control:ephemeral). OpenAI cacheia
 *     automaticamente prefixos ≥1024 tokens.
 *  4. User message DENSO — `K: V` em linha única quando faz sentido.
 *     Listas longas truncadas no provider edge (ver SAMPLE_INPUTS abaixo).
 *  5. Truncamentos explícitos — `htmlSample.slice(0, 4500)`,
 *     `recentSlugs.slice(0, 30)`, etc. Cada `slice` tem comentário do porquê.
 *
 *  COMO ADICIONAR UM PROMPT NOVO
 *  ─────────────────────────────
 *  1. Crie/garanta o Zod schema em `ai/schemas.ts`.
 *  2. Adicione a `interface XInput` na seção INPUTS abaixo.
 *  3. Adicione `xPrompt: PromptDef<XInput>` na seção PROMPTS.
 *  4. Registre em `prompts` (final do arquivo).
 *  5. (Opcional, mas recomendado) adicione um sample em `SAMPLE_INPUTS`
 *     pra aparecer na página de visualização do admin.
 *  6. Crie a skill em `ai/skills/x.ts` chamando `provider.generateStructured`.
 *
 *  COMO REVISAR A QUALIDADE DOS PROMPTS
 *  ────────────────────────────────────
 *  - Endpoint: `GET /api/v1/prompts` (auth) — JSON com todos os prompts
 *    renderizados (system completo + user com sample input).
 *  - UI: `/configuracoes/prompts` no admin — cada prompt num card,
 *    com estimativa de tokens.
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─── BUILDING BLOCKS ───────────────────────────────────────────────────────

/**
 * Persona compartilhada por todas as skills editoriais.
 * Curta de propósito — o resto do contexto é injetado pela skill.
 */
const PERSONA = `Você é editor-chefe e redator sênior de blog editorial de nicho. Texto que você produz precisa parecer escrito por humano com experiência real, não por IA.`;

/**
 * Disciplina de output. Vale para qualquer chamada estruturada — o
 * provider força o formato via schema; aqui reforçamos o que o modelo
 * deve EVITAR (preâmbulo, preenchimento de schema com placeholders).
 */
const OUTPUT_DISCIPLINE = `Output:
- Responda APENAS via tool/structured output. Sem preâmbulo, sem comentário, sem markdown ao redor.
- Preencha cada campo com conteúdo REAL. "string", "lorem", "exemplo" não são respostas.
- Use o idioma indicado no input. Se faltar, use pt-BR.`;

/**
 * Regras editoriais — guardrails contra "texto de IA" típico (fluff,
 * hedging, frases-elevador). Densas, em bullets, sem prosa redundante.
 */
const EDITORIAL = `Editorial:
- Especificidade > genérico. Use número, gramatura, tempo, temperatura, ano, marca, modelo, preço.
- Voz ativa, frases curtas. Frase passiva longa = sintoma de IA.
- Banidas: "no mundo de hoje", "é importante notar/destacar", "em conclusão", "esperamos que", "existem várias maneiras", "vamos explorar/descobrir/mergulhar", "você já se perguntou…".
- Sem hedging covarde — "X funciona porque Y" > "pode ser que talvez X funcione".
- Tome posição quando faz sentido. "Y > X em Z" > "ambos têm vantagens".
- Cite fonte quando alegar fato externo: "segundo a SCA (2024)" > "estudos mostram".
- Parágrafo 1 entrega valor. Sem "neste artigo vamos abordar".
- Use lista/tabela só quando há enumeração ou comparação real, nunca pra disfarçar texto fraco.`;

/**
 * Princípios de SEO + GEO (Google + LLMs). Aplicado em skills de
 * outline/article/metadata.
 */
const SEO_GEO = `SEO/GEO:
- Title 50-60 chars, palavra-chave principal nos primeiros 30.
- Meta description 140-160 chars com benefício concreto, sem "saiba mais".
- H1 único; H2 = pergunta ou etapa; H3 detalha.
- "Answer-first": cada seção responde em 1-2 frases antes de aprofundar.
- Tabela comparativa e lista numerada têm alta taxa de citação por LLMs e featured snippets.
- FAQ ao final com 3-5 perguntas reais.
- Slug kebab-case, ≤60 chars, com palavra-chave principal.`;

/**
 * Compositor — junta blocos com 1 linha em branco, sem trailing whitespace.
 */
function compose(...parts: string[]): string {
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .join('\n\n');
}

// ─── INPUTS ────────────────────────────────────────────────────────────────

export interface BrainstormTopicsInput {
  channelName: string;
  niche: string;
  language: string;
  /** Slugs dos últimos posts publicados — pra não repetir tema. */
  recentSlugs?: string[];
  /** Categorias existentes — útil pra balancear cobertura. */
  existingCategories?: { slug: string; name: string }[];
}

export interface SelectTopicInput {
  channelName: string;
  niche: string;
  candidates: import('./schemas.js').TopicCandidate[];
  recentSlugs?: string[];
  recentFormats?: Record<string, number>;
}

export interface OutlineArticleInput {
  refinedTitle: string;
  primaryKeyword: string;
  secondaryKeywords?: string[];
  intent: string;
  format: string;
  audienceLevel: string;
  niche: string;
  language: string;
  channelName: string;
}

export interface WriteArticleInput {
  refinedTitle: string;
  hook: string;
  sections: {
    h2: string;
    answerFirst: string;
    mustInclude: string[];
    h3s?: string[];
    useTable?: boolean;
    useNumberedList?: boolean;
  }[];
  faq: { question: string; answerHint: string }[];
  wordCountTarget: number;
  primaryKeyword: string;
  secondaryKeywords?: string[];
  language: string;
  channelName: string;
  niche: string;
}

export interface GenerateMetadataInput {
  title: string;
  content: string;
  excerpt: string;
  primaryKeyword: string;
  secondaryKeywords?: string[];
  niche: string;
  channelName: string;
  language: string;
}

export interface GenerateImagePromptInput {
  articleTitle: string;
  articleSummary: string;
  niche: string;
  visualStyle?: string;
}

export interface GenerateCategoryInput {
  title: string;
  excerpt: string;
  niche: string;
  existing: { slug: string; name: string }[];
}

export interface GenerateTagsInput {
  title: string;
  excerpt: string;
  niche: string;
  contentExcerpt?: string;
  existingTags?: string[];
}

export interface AnalyzeSitePromptInput {
  channelName: string;
  niche: string;
  siteUrl: string;
  htmlSample: string;
  technicalSummary: {
    performance: { score: number; loadTimeMs: number; htmlSizeKb: number };
    seo: {
      score: number;
      hasTitle: boolean;
      titleLength: number;
      hasMetaDescription: boolean;
      hasCanonical: boolean;
      hasOpenGraph: boolean;
      hasH1: boolean;
    };
    geo: {
      score: number;
      jsonLdCount: number;
      hasLlmsTxt: boolean;
      hasRssFeed: boolean;
      botsAllowed: boolean;
    };
    discovery: { hasRobotsTxt: boolean; hasSitemap: boolean };
  };
}

// ─── PROMPT DEFINITION SHAPE ───────────────────────────────────────────────

export interface PromptDef<I> {
  /** Slug curto — usado em logs e tool name no provider. */
  name: string;
  /** Versão — bumpe ao mudar `system` (não em ajustes em `user`). */
  version: string;
  /** Resumo de 1 linha — aparece no visualizador. */
  description: string;
  /** System prompt completo, composto de building blocks. */
  system: string;
  /** Builder do user message — recebe input tipado, retorna string densa. */
  user: (input: I) => string;
}

// ─── PROMPTS ───────────────────────────────────────────────────────────────

export const brainstormTopicsPrompt: PromptDef<BrainstormTopicsInput> = {
  name: 'brainstorm-topics',
  version: '2.0.0',
  description: 'Lista 8-10 candidatos de pauta diversificados em ângulo, intenção e nível.',
  system: compose(
    PERSONA,
    `Tarefa: gerar candidatos de pauta diversificados, considerando o que já foi publicado e o que o público busca.

Critérios de qualidade:
- Cada candidato com ÂNGULO único (formato, recorte, ponto de vista). Sem 5 variações da mesma pergunta.
- Diversifique INTENÇÃO: informational, comparison, how-to, opinion, troubleshooting, review.
- Diversifique NÍVEL: alguns para iniciante, outros intermediário/avançado.
- Long-tail: tema específico (3-5 palavras) ranqueia mais fácil.
- Rejeite tema que repete slug recente ou ângulo de slug recente.
- Para cada candidato, declare o gap que preenche e a intenção primária de busca.`,
    OUTPUT_DISCIPLINE,
  ),
  user: (input) => {
    const lines: string[] = [];
    lines.push(`Canal: ${input.channelName} | Nicho: ${input.niche} | Idioma: ${input.language} | Ano: ${new Date().getFullYear()}`);
    if (input.existingCategories?.length) {
      lines.push('');
      lines.push('Categorias existentes (balanceie):');
      for (const c of input.existingCategories) lines.push(`- ${c.name} (${c.slug})`);
    }
    if (input.recentSlugs?.length) {
      lines.push('');
      // 30 slugs cobre ~2 meses de posts diários — suficiente pra detectar overlap. Mais que isso é desperdício de tokens.
      lines.push('Slugs recentes (NÃO repita ângulo):');
      for (const s of input.recentSlugs.slice(0, 30)) lines.push(`- ${s}`);
    }
    lines.push('');
    lines.push('Gere 8-10 candidatos diversificados.');
    return lines.join('\n');
  },
};

export const selectTopicPrompt: PromptDef<SelectTopicInput> = {
  name: 'select-topic',
  version: '2.0.0',
  description: 'Escolhe 1 candidato dos N gerados pelo brainstorm e refina o título.',
  system: compose(
    PERSONA,
    `Tarefa: escolher a pauta de hoje entre candidatos.

Critérios em ordem de prioridade:
1. Gap de cobertura — prefira tema que cobre lacuna real do canal vs últimos posts.
2. Intenção de busca — how-to e comparison têm alta intenção; opinião gera engajamento mas menos tráfego.
3. Utilidade — leitor sai com algo aplicável imediato?
4. Sem repetição — rejeite candidato que repete ângulo de slug recente.
5. Balanceamento — se canal só tem how-tos recentes, varie formato.

Decida UM. Sem empate. Justifique citando os critérios.`,
    OUTPUT_DISCIPLINE,
  ),
  user: (input) => {
    const lines: string[] = [];
    lines.push(`Canal: ${input.channelName} | Nicho: ${input.niche}`);
    lines.push('');
    lines.push('Candidatos:');
    input.candidates.forEach((c, i) => {
      lines.push(`#${i + 1}. ${c.workingTitle}`);
      lines.push(`   intent:${c.intent} | format:${c.format} | level:${c.audienceLevel}`);
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

export const outlineArticlePrompt: PromptDef<OutlineArticleInput> = {
  name: 'outline-article',
  version: '2.0.0',
  description: 'Define a estrutura do artigo — hook, H2s, must-include, FAQ, alvo de palavras.',
  system: compose(
    PERSONA,
    `Tarefa: definir a ESTRUTURA do artigo antes da redação. Outline bom = artigo bom.

Regras:
- Liste H2s na ordem em que aparecem. Cada H2 = promessa concreta de valor.
- Para cada H2, declare o que PRECISA estar presente: dados, exemplos, comparações, números.
- Pelo menos UMA tabela ou lista numerada se o tema permitir (citação por LLMs + featured snippet).
- FAQ ao final com 3-5 perguntas reais que o leitor faria DEPOIS de ler.
- Hook: tese forte ou número/dado surpreendente. Sem "neste artigo vamos…".`,
    EDITORIAL,
    SEO_GEO,
    OUTPUT_DISCIPLINE,
  ),
  user: (input) => {
    const lines: string[] = [];
    lines.push(`Canal: ${input.channelName} | Nicho: ${input.niche} | Idioma: ${input.language}`);
    lines.push(`Título: ${input.refinedTitle}`);
    lines.push(`Keyword: ${input.primaryKeyword}`);
    if (input.secondaryKeywords?.length) lines.push(`Secundárias: ${input.secondaryKeywords.join(', ')}`);
    lines.push(`Intent: ${input.intent} | Format: ${input.format} | Level: ${input.audienceLevel}`);
    lines.push('');
    lines.push('Crie o outline detalhado.');
    return lines.join('\n');
  },
};

export const writeArticlePrompt: PromptDef<WriteArticleInput> = {
  name: 'write-article',
  version: '2.0.0',
  description: 'Executa o outline produzindo markdown editorial completo.',
  system: compose(
    PERSONA,
    `Tarefa: EXECUTAR o outline com qualidade alta — não decidir estrutura (já decidida) nem editar (vem depois). Escreva markdown que cumpre o que cada seção promete.

Execução:
- Siga o outline exatamente. Cada h2 vira ##, cada h3 vira ###. Não adicione nem remova seções.
- Cada seção começa com a frase answer-first do outline (pode reescrever pra fluir; mantenha a essência), depois aprofunda.
- Cubra TODOS os "mustInclude" da seção. Se faltar, o artigo fica raso.
- useTable=true → gere tabela markdown real. useNumberedList=true → lista numerada com passos concretos.
- Tom: especialista falando com leigo informado. Direto, sem condescender.
- Comprimento: ±15% do wordCountTarget. Não ench linguiça.
- FAQ: 2-4 frases por resposta, específicas.
- Markdown permitido: # ## ### **bold** *italic* listas tabelas \`code\` > blockquote. Nada além.
- NÃO inclua links no texto (UI insere depois).`,
    EDITORIAL,
    SEO_GEO,
    OUTPUT_DISCIPLINE,
  ),
  user: (input) => {
    const lines: string[] = [];
    lines.push(`Canal: ${input.channelName} | Nicho: ${input.niche} | Idioma: ${input.language}`);
    lines.push(`Título: # ${input.refinedTitle}`);
    lines.push(`Keyword: ${input.primaryKeyword}`);
    if (input.secondaryKeywords?.length) lines.push(`Secundárias: ${input.secondaryKeywords.join(', ')}`);
    lines.push(`Meta de palavras: ~${input.wordCountTarget}`);
    lines.push('');
    lines.push(`Hook: ${input.hook}`);
    lines.push('');
    lines.push('Outline:');
    input.sections.forEach((s, i) => {
      lines.push(`${i + 1}. ## ${s.h2}`);
      lines.push(`   answer-first: ${s.answerFirst}`);
      lines.push(`   incluir: ${s.mustInclude.join('; ')}`);
      if (s.h3s?.length) lines.push(`   subseções: ${s.h3s.join(' / ')}`);
      if (s.useTable) lines.push(`   ⚠ TABELA markdown real`);
      if (s.useNumberedList) lines.push(`   ⚠ LISTA NUMERADA com passos`);
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

export const generateMetadataPrompt: PromptDef<GenerateMetadataInput> = {
  name: 'generate-metadata',
  version: '2.0.0',
  description: 'Gera metaTitle/metaDescription/slug/keywords/tags/summary do post finalizado.',
  system: compose(
    PERSONA,
    `Tarefa: gerar metadata SEO/GEO de um artigo finalizado.

Prioridades:
- metaTitle: 50-60 chars, keyword principal nos 30 primeiros, gancho sem clickbait.
- metaDescription: 140-160 chars, com benefício concreto. Não "saiba mais".
- slug: kebab-case, 3-7 palavras, sem stopwords ("o", "a", "de", "para") quando possível.
- keywords: 5-8 termos. Inclui primary, secondary e long-tail. Sem repetição.
- suggestedTags: 3-6 tags em kebab-case. Mais específicas que keywords.
- summary: 2-3 frases para preview de cards/redes.

Proibido: clickbait ("VOCÊ NÃO VAI ACREDITAR", "O SEGREDO QUE NINGUÉM TE CONTOU"). Confiabilidade > CTR de curto prazo.`,
    SEO_GEO,
    OUTPUT_DISCIPLINE,
  ),
  user: (input) => {
    const lines: string[] = [];
    lines.push(`Canal: ${input.channelName} | Nicho: ${input.niche} | Idioma: ${input.language}`);
    lines.push(`Título: ${input.title}`);
    lines.push(`Keyword: ${input.primaryKeyword}`);
    if (input.secondaryKeywords?.length) lines.push(`Secundárias: ${input.secondaryKeywords.join(', ')}`);
    lines.push('');
    lines.push(`Resumo: ${input.excerpt}`);
    lines.push('');
    // 2000 chars cobrem ~500 tokens — 2-3 seções iniciais. Suficiente pro modelo entender o tom; mais que isso é desperdício.
    lines.push('Trecho do conteúdo (primeiras seções):');
    lines.push(input.content.slice(0, 2000));
    return lines.join('\n');
  },
};

export const generateImagePromptPrompt: PromptDef<GenerateImagePromptInput> = {
  name: 'generate-image-prompt',
  version: '2.0.0',
  description: 'Brief visual da imagem de capa: prompt em inglês, alt em português, mood.',
  system: compose(
    `Você é diretor de arte criando o brief visual da capa.

Regras:
- Editorial fotográfica. Nunca infográfico, colagem ou render 3D estilizado.
- 16:9, foco claro num assunto principal, profundidade de campo.
- Iluminação natural ou suave, paleta consistente com o nicho.
- SEM TEXTO sobreposto (ruim em redes/cards). SEM logos de marcas reais.
- Composição que funciona em thumbnail (legível a 320px de largura).

Output:
- prompt: descrição rica em INGLÊS (modelos de imagem performam melhor em inglês), no estilo de roteiro de fotografia editorial. Inclua sujeito, contexto, iluminação, ângulo, cores, clima, lente.
- negativePrompt: o que evitar (text, watermark, low quality, cartoon, etc).
- alt: alt-text em português, 80-140 chars, descritivo para leitor de tela.
- mood: 1-3 palavras (ex: "calm, tactile, editorial").`,
    OUTPUT_DISCIPLINE,
  ),
  user: (input) => {
    const lines: string[] = [];
    lines.push(`Nicho: ${input.niche}`);
    lines.push(`Título: ${input.articleTitle}`);
    lines.push(`Resumo: ${input.articleSummary}`);
    if (input.visualStyle) lines.push(`Estilo do canal: ${input.visualStyle}`);
    return lines.join('\n');
  },
};

export const generateCategoryPrompt: PromptDef<GenerateCategoryInput> = {
  name: 'generate-category',
  version: '2.0.0',
  description: 'Decide reutilizar categoria existente ou criar nova para o post.',
  system: compose(
    `Você organiza conteúdo editorial em categorias amplas (4-8 por canal no total).

Regras:
- PREFIRA reutilizar categoria existente se for compatível, mesmo com ângulo levemente diferente. Múltiplas categorias com 1-2 posts cada poluem a navegação.
- Crie nova só se o tema realmente não couber em nenhuma existente.
- Slug kebab-case, ≤25 chars. Nome curto e claro (1-3 palavras).
- Description: 100-200 chars descrevendo o tipo de conteúdo da categoria (não o post atual).`,
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
      lines.push('(nenhuma — pode criar a primeira)');
    } else {
      for (const c of input.existing) lines.push(`- ${c.slug} — ${c.name}`);
    }
    return lines.join('\n');
  },
};

export const generateTagsPrompt: PromptDef<GenerateTagsInput> = {
  name: 'generate-tags',
  version: '2.0.0',
  description: 'Extrai 3-6 tags do post para SEO interno e descoberta.',
  system: compose(
    `Tarefa: extrair 3-6 tags para SEO interno e descoberta.

Regras:
- kebab-case, sem acentos, sem stopwords ("o", "a", "para").
- Reutilize tags existentes do canal sempre que possível (cluster de conteúdo).
- Não repita o título inteiro como tag.
- Não use plural óbvio se a versão singular já existe (e vice-versa).
- Mistura ideal: 1-2 tags amplas + 2-3 específicas do post + 1 contextual quando faz sentido.`,
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
      // 50 cobre o cluster típico de tags de um canal — suficiente pra o modelo decidir reuso.
      lines.push(`Tags existentes (reutilize quando fizer sentido): ${input.existingTags.slice(0, 50).join(', ')}`);
    }
    return lines.join('\n');
  },
};

export const analyzeSitePrompt: PromptDef<AnalyzeSitePromptInput> = {
  name: 'analyze-site',
  version: '2.0.0',
  description: 'Insights estratégicos editoriais/SEO/GEO sobre um site (4-8 itens).',
  system: compose(
    `Você é analista editorial e SEO/GEO sênior. Avalia sites de nicho com recomendações específicas e acionáveis.

Foque no que NÃO aparece em métricas técnicas:
- Profundidade e originalidade do conteúdo.
- Autoridade percebida (E-E-A-T).
- Lacunas de cobertura no nicho.
- Hierarquia editorial e UX de leitura.
- Oportunidades estratégicas.

Regras:
- NÃO repita o que o audit técnico já mostrou (presença de title, sitemap, etc).
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
    // 4500 chars ~ 1100 tokens — bom equilíbrio. Antes era 6000 (1500 tokens) sem ganho perceptível na qualidade dos insights.
    lines.push('HTML da home:');
    lines.push('```html');
    lines.push(input.htmlSample.slice(0, 4500));
    lines.push('```');
    lines.push('');
    lines.push('Gere 4-8 insights estratégicos.');
    return lines.join('\n');
  },
};

// ─── REGISTRY ──────────────────────────────────────────────────────────────

export const prompts = {
  brainstormTopics: brainstormTopicsPrompt,
  selectTopic: selectTopicPrompt,
  outlineArticle: outlineArticlePrompt,
  writeArticle: writeArticlePrompt,
  generateMetadata: generateMetadataPrompt,
  generateImagePrompt: generateImagePromptPrompt,
  generateCategory: generateCategoryPrompt,
  generateTags: generateTagsPrompt,
  analyzeSite: analyzeSitePrompt,
} as const;

export type PromptName = keyof typeof prompts;

// ─── VISUALIZER ────────────────────────────────────────────────────────────

/**
 * Inputs sintéticos pra renderizar o `user(input)` de cada skill na página
 * de inspeção do admin. NÃO são usados em runtime — só pelo endpoint
 * `/api/v1/prompts`.
 */
const SAMPLE_INPUTS: { [K in PromptName]: Parameters<(typeof prompts)[K]['user']>[0] } = {
  brainstormTopics: {
    channelName: 'Sonoprofundo',
    niche: 'sono',
    language: 'pt-BR',
    recentSlugs: ['higiene-do-sono-em-7-habitos', 'luz-azul-mito-ou-vilao'],
    existingCategories: [
      { slug: 'higiene-do-sono', name: 'Higiene do Sono' },
      { slug: 'ciencia-do-sono', name: 'Ciência do Sono' },
    ],
  },
  selectTopic: {
    channelName: 'Sonoprofundo',
    niche: 'sono',
    candidates: [
      {
        workingTitle: 'Por que acordo às 3 da manhã todo dia',
        angle: 'Causas fisiológicas vs comportamentais do despertar precoce.',
        intent: 'troubleshooting',
        audienceLevel: 'beginner',
        format: 'article',
        primaryKeyword: 'acordar 3 da manhã',
        secondaryKeywords: ['insônia matinal'],
        gapFilled: 'Não há post cobrindo despertar específico de madrugada.',
        valueDelivered: 'Leitor identifica a causa provável e ajusta protocolo.',
      },
    ],
    recentSlugs: ['higiene-do-sono-em-7-habitos'],
    recentFormats: { article: 4, 'how-to': 2 },
  },
  outlineArticle: {
    refinedTitle: 'Por que acordo às 3 da manhã todo dia — e como parar',
    primaryKeyword: 'acordar 3 da manhã',
    secondaryKeywords: ['despertar precoce', 'insônia matinal'],
    intent: 'troubleshooting',
    format: 'article',
    audienceLevel: 'beginner',
    niche: 'sono',
    language: 'pt-BR',
    channelName: 'Sonoprofundo',
  },
  writeArticle: {
    refinedTitle: 'Por que acordo às 3 da manhã todo dia — e como parar',
    hook: 'Acordar entre 2h e 4h não é "estresse" genérico — é um sinal específico do ciclo de cortisol e da fragmentação do sono REM.',
    sections: [
      {
        h2: 'O que está acontecendo às 3 da manhã',
        answerFirst: 'É a transição entre fases do sono, vulnerável a despertar quando há estímulo extra.',
        mustInclude: ['ciclo de cortisol', 'fase REM tardia', 'limiar de excitação'],
        useTable: false,
        useNumberedList: false,
      },
    ],
    faq: [{ question: 'Devo levantar ou ficar deitado?', answerHint: 'Regra dos 20 minutos' }],
    wordCountTarget: 1100,
    primaryKeyword: 'acordar 3 da manhã',
    language: 'pt-BR',
    channelName: 'Sonoprofundo',
    niche: 'sono',
  },
  generateMetadata: {
    title: 'Por que acordo às 3 da manhã todo dia',
    content: '# Por que acordo às 3 da manhã...\n\nAcordar entre 2h e 4h é um sinal...',
    excerpt: 'Causas fisiológicas e comportamentais do despertar precoce, e o protocolo para parar.',
    primaryKeyword: 'acordar 3 da manhã',
    niche: 'sono',
    channelName: 'Sonoprofundo',
    language: 'pt-BR',
  },
  generateImagePrompt: {
    articleTitle: 'Por que acordo às 3 da manhã',
    articleSummary: 'Despertar precoce, suas causas e como interromper o ciclo.',
    niche: 'sono',
    visualStyle: 'editorial dark, amber accent',
  },
  generateCategory: {
    title: 'Por que acordo às 3 da manhã',
    excerpt: 'Despertar precoce e protocolo de retorno ao sono.',
    niche: 'sono',
    existing: [
      { slug: 'higiene-do-sono', name: 'Higiene do Sono' },
      { slug: 'ciencia-do-sono', name: 'Ciência do Sono' },
    ],
  },
  generateTags: {
    title: 'Por que acordo às 3 da manhã todo dia',
    excerpt: 'Despertar precoce e como parar.',
    niche: 'sono',
    existingTags: ['higiene-do-sono', 'iniciante', 'ciencia'],
  },
  analyzeSite: {
    channelName: 'Sonoprofundo',
    niche: 'sono',
    siteUrl: 'https://sonoprofundo.com',
    htmlSample: '<html><head><title>Sonoprofundo</title></head><body><h1>Hello</h1></body></html>',
    technicalSummary: {
      performance: { score: 92, loadTimeMs: 800, htmlSizeKb: 45 },
      seo: {
        score: 88,
        hasTitle: true,
        titleLength: 35,
        hasMetaDescription: true,
        hasCanonical: true,
        hasOpenGraph: true,
        hasH1: true,
      },
      geo: { score: 78, jsonLdCount: 3, hasLlmsTxt: true, hasRssFeed: true, botsAllowed: true },
      discovery: { hasRobotsTxt: true, hasSitemap: true },
    },
  },
};

/**
 * Estimativa rápida de tokens — heurística ~4 chars/token (em pt-BR fica
 * mais próximo de 3.5, mas 4 é um bom limite superior). Não é exata mas
 * dá ordem de grandeza na UI.
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export interface PromptInspection {
  key: PromptName;
  name: string;
  version: string;
  description: string;
  system: string;
  systemTokens: number;
  /** User message renderizado com input sintético — só pra visualização. */
  userSample: string;
  userSampleTokens: number;
  totalTokens: number;
}

/**
 * Renderiza todos os prompts em formato consumível pela UI/CLI.
 * NÃO chame em runtime de pipeline — é só pra inspeção.
 */
export function inspectAllPrompts(): PromptInspection[] {
  return (Object.keys(prompts) as PromptName[]).map((key) => {
    const p = prompts[key];
    const sample = SAMPLE_INPUTS[key];
    const userSample = (p.user as (input: unknown) => string)(sample);
    return {
      key,
      name: p.name,
      version: p.version,
      description: p.description,
      system: p.system,
      systemTokens: estimateTokens(p.system),
      userSample,
      userSampleTokens: estimateTokens(userSample),
      totalTokens: estimateTokens(p.system) + estimateTokens(userSample),
    };
  });
}
