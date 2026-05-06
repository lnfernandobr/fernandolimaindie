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
      'Adultos 25-50 anos sofrendo com sono ruim recorrente. Sabe que dorme mal mas não tem diagnóstico clínico. Busca informação confiável sem sensacionalismo, com ações práticas.',
    voice:
      'Direto, baseado em ciência, calmo. Não amedronta nem promete milagre. Reconhece que a pessoa já tentou várias coisas que falharam.',
    authority:
      'Cite estudos peer-reviewed quando alegar efeito clínico (PubMed, NIH, Sleep Medicine Reviews). Indique TCC-I com profissional quando o caso passa do que higiene do sono cobre.',
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
  audience: `Leitor adulto interessado no tema, com leitura média. Quer informação útil, sem fluff.`,
  voice: `Especialista direto, sem condescender. Confiante. Reconhece limites quando a evidência é fraca.`,
  authority: `Cite fonte primária quando alegar fato externo. Reconheça incerteza quando ela existe.`,
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
