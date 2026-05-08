/**
 * Brand profile: contexto de marca/canal injetado nos prompts.
 *
 * Cada canal (Channel no Mongo) tem `niche`, `name`, `language`, `notes`.
 * Esse módulo deriva o brand profile a partir desses dados, com fallback
 * editorial quando o canal não traz instrução específica.
 *
 * O profile vira um bloco de texto que entra no `system` dos prompts que
 * geram conteúdo (redação, metadata, CTA). Mantém a marca consistente sem
 * cada prompt ter que repetir contexto.
 */

export interface BrandInputs {
  channelName: string;
  niche: string;
  language?: string;
  /** Notes livres do admin (notes do Channel) com diretrizes de marca. */
  notes?: string;
}

export interface BrandProfile {
  channelName: string;
  niche: string;
  language: string;
  /** Bloco renderizado para entrar no `system` do prompt. */
  systemBlock: string;
}

/**
 * Defaults por nicho. Quando o admin não setou `notes`, usamos esse mapa
 * pra dar tom e contexto coerente. Adicionar nicho novo aqui propaga pra
 * todos os prompts que dependem de brand.
 */
const NICHE_DEFAULTS: Record<string, { audience: string; voice: string; authority: string }> = {
  sono: {
    audience:
      'Adulto entre 22 e 55 anos interessado em sono no sentido amplo: dorme mal e quer melhorar, ou só é curioso sobre o tema (porque todo mundo dorme). Mistura de quem busca solução prática (insônia, ronco, cansaço) com quem busca conteúdo leve e cultural (sonhos, hábitos, bons travesseiros, app de sono, história da siesta, sono dos animais). NÃO é leitor médico. Quer texto gostoso de ler antes de dormir, não paper acadêmico.',
    voice:
      'Amigo informado conversando no sofá. Calmo, humano, com humor sutil quando cabe. Mistura ciência leve (quando ajuda) com história, observação, analogia do dia a dia. Não amedronta nem promete milagre. Não cita estudo em todo parágrafo — só quando o tema realmente exige.',
    authority:
      'Cite fonte SOMENTE quando alegar efeito clínico forte (dose, eficácia, prevalência) — máximo 2 a 3 referências por artigo. Em conteúdo lifestyle/curiosidade, NÃO cite. Indique procurar especialista para insônia crônica, apneia, narcolepsia. Para hábitos comuns (siesta, travesseiro, rotina noturna) basta opinião editorial bem fundamentada.',
  },
  cafe: {
    audience:
      'Entusiastas de café especial em fase intermediária. Já compraram moedor, balança e prensa francesa, agora querem extrair melhor.',
    voice:
      'Especialista que valida com dado, não com opinião. Tabelas e parâmetros. Sem nostalgia ou romantismo de café.',
    authority:
      'Cite SCA (Specialty Coffee Association) quando relevante. Use parâmetros mensuráveis (TDS, gramatura, tempo).',
  },
  violao: {
    audience:
      'Iniciantes ou intermediários estudando violão sozinhos. Pouca paciência pra teoria pura, valorizam exercício prático com sinal claro de progresso.',
    voice:
      'Professor que explica o porquê, não só o como. Mostra padrão antes de exceção. Frequência de prática realista.',
    authority:
      'Cite método ou tradição quando aplicável (Bossa nova, MPB, fingerstyle). Mencione ergonomia para evitar lesão.',
  },
};

const FALLBACK = {
  audience: `Leitor adulto curioso sobre o tema, com leitura média. Quer texto útil e gostoso de ler — informação real, mas sem cara de paper acadêmico.`,
  voice: `Conversa de amigo informado. Direto sem ser técnico, confiante sem condescender. Mistura especialização com tom humano.`,
  authority: `Cite fonte só quando alegar dado clínico forte. Para conselho prático, lifestyle, opinião — sem citação.`,
};

export function buildBrandProfile(input: BrandInputs): BrandProfile {
  const niche = input.niche.toLowerCase();
  const def = NICHE_DEFAULTS[niche] ?? FALLBACK;
  const language = input.language || 'pt-BR';

  const lines: string[] = [];
  lines.push(`Marca: ${input.channelName}`);
  lines.push(`Nicho: ${input.niche}`);
  lines.push(`Idioma: ${language}`);
  lines.push('');
  lines.push(`Público-alvo: ${def.audience}`);
  lines.push('');
  lines.push(`Voz da marca: ${def.voice}`);
  lines.push('');
  lines.push(`Autoridade: ${def.authority}`);

  if (input.notes && input.notes.trim().length > 0) {
    lines.push('');
    lines.push('Diretrizes específicas do canal (priorize estas em caso de conflito):');
    lines.push(input.notes.trim());
  }

  return {
    channelName: input.channelName,
    niche: input.niche,
    language,
    systemBlock: lines.join('\n'),
  };
}
