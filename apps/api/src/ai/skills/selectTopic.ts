import { prompts, type SelectTopicInput, type TopicCandidate } from '../prompts/index.js';
import { getTextProvider } from '../providers/index.js';
import { parseJson } from './shared.js';

export interface SelectedTopic {
  selected: TopicCandidate;
  refinedTitle: string;
  reasoning: string;
  provider: string;
}

export async function selectTopic(input: SelectTopicInput): Promise<SelectedTopic> {
  if (input.candidates.length === 0) throw new Error('selectTopic: no candidates');

  const provider = await getTextProvider();
  const result = await provider.generateText({
    jsonMode: true,
    messages: [
      { role: 'system', content: prompts.selectTopic.system },
      { role: 'user', content: prompts.selectTopic.user(input) },
    ],
  });
  const data = parseJson<{
    selectedIndex?: number | string;
    reasoning?: string;
    refinedTitle?: string;
  }>(result.text);

  const idx =
    typeof data.selectedIndex === 'number'
      ? data.selectedIndex - 1
      : Math.max(0, Number(String(data.selectedIndex ?? '1').match(/\d+/)?.[0] ?? '1') - 1);
  const safeIdx = Math.max(0, Math.min(input.candidates.length - 1, idx));
  const selected = input.candidates[safeIdx]!;

  return {
    selected,
    refinedTitle: (data.refinedTitle ?? selected.workingTitle).slice(0, 120),
    reasoning: data.reasoning ?? 'auto-selected',
    provider: result.provider,
  };
}
