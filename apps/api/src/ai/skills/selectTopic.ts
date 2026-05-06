import { prompts, type SelectTopicInput } from '../prompts/index.js';
import { getTextProvider } from '../providers/index.js';
import { selectTopicSchema } from '../schemas.js';
import type { TopicCandidate } from '../schemas.js';

export interface SelectedTopic {
  selected: TopicCandidate;
  refinedTitle: string;
  reasoning: string;
  provider: string;
}

export async function selectTopic(input: SelectTopicInput): Promise<SelectedTopic> {
  if (input.candidates.length === 0) throw new Error('selectTopic: no candidates');

  const provider = await getTextProvider();
  const { data, provider: providerName } = await provider.generateStructured({
    schemaName: 'SelectTopic',
    schemaDescription: 'Escolhe um candidato (1-indexed) e justifica.',
    schema: selectTopicSchema,
    messages: [
      { role: 'system', content: prompts.selectTopic.system },
      { role: 'user', content: prompts.selectTopic.user(input) },
    ],
  });

  const safeIdx = Math.max(0, Math.min(input.candidates.length - 1, data.selectedIndex - 1));
  const selected = input.candidates[safeIdx]!;

  return {
    selected,
    refinedTitle: data.refinedTitle.slice(0, 120),
    reasoning: data.reasoning,
    provider: providerName,
  };
}
