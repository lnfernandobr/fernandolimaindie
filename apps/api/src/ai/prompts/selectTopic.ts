import { jsonOutputContract } from './_shared.js';
import type { TopicCandidate } from '../schemas.js';

export type { TopicCandidate };

export interface SelectTopicInput {
  channelName: string;
  niche: string;
  candidates: TopicCandidate[];
  /** Slugs recentes — confirma novamente que não há overlap. */
  recentSlugs?: string[];
  /** Distribuição atual de formatos (pra balancear). */
  recentFormats?: Record<string, number>;
}

const SYSTEM = `
Você é editor-chefe escolhendo a pauta de hoje entre uma lista de candidatos.

CRITÉRIOS DE DECISÃO (em ordem de prioridade):
1. GAP DE COBERTURA: prefira o tema que cobre uma lacuna real do canal vs últimos posts.
2. INTENÇÃO DE BUSCA: priorize temas com volume/intenção clara (how-to e comparison costumam ter alta intenção; opinião gera engajamento mas menos tráfego).
3. UTILIDADE: o leitor sai com algo aplicável imediatamente?
4. SEM REPETIÇÃO: rejeite candidatos que repetem ângulo de slug recente.
5. BALANCEAMENTO: se o canal só tem how-tos recentes, prefira variar formato.

DECIDA UM. Sem empates. Justifique sua escolha mencionando os critérios usados.
`;

export const selectTopicPrompt = {
  name: 'select-topic',
  system: SYSTEM,
  user: (input: SelectTopicInput): string => {
    const lines: string[] = [];
    lines.push(`Canal: ${input.channelName}`);
    lines.push(`Nicho: ${input.niche}`);
    lines.push('');
    lines.push('Candidatos:');
    input.candidates.forEach((c, i) => {
      lines.push(`#${i + 1}. ${c.workingTitle}`);
      lines.push(`   intent: ${c.intent} | format: ${c.format} | level: ${c.audienceLevel}`);
      lines.push(`   ângulo: ${c.angle}`);
      lines.push(`   keyword: ${c.primaryKeyword}`);
      if (c.gapFilled) lines.push(`   gap: ${c.gapFilled}`);
      lines.push('');
    });
    if (input.recentSlugs?.length) {
      lines.push('Slugs recentes (use pra detectar overlap):');
      for (const s of input.recentSlugs.slice(0, 30)) lines.push(`- ${s}`);
      lines.push('');
    }
    if (input.recentFormats && Object.keys(input.recentFormats).length) {
      lines.push('Distribuição de formatos nos últimos posts:');
      for (const [f, n] of Object.entries(input.recentFormats)) lines.push(`- ${f}: ${n}`);
      lines.push('');
    }
    lines.push('Escolha 1 candidato e justifique.');
    lines.push(
      jsonOutputContract({
        selectedIndex: 'número do candidato escolhido (1-based)',
        reasoning: '2-3 frases explicando a escolha citando os critérios usados',
        refinedTitle: 'Título refinado, 50-60 chars, com a palavra-chave principal nos primeiros 30 chars',
      }),
    );
    return lines.join('\n');
  },
};
