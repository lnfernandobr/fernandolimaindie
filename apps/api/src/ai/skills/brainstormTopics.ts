import { prompts, type BrainstormTopicsInput, type TopicCandidate } from '../prompts/index.js';
import { getTextProvider } from '../providers/index.js';
import { parseJson } from './shared.js';

export interface BrainstormResult {
  candidates: TopicCandidate[];
  provider: string;
}

export async function brainstormTopics(input: BrainstormTopicsInput): Promise<BrainstormResult> {
  const provider = await getTextProvider();
  const result = await provider.generateText({
    jsonMode: true,
    messages: [
      { role: 'system', content: prompts.brainstormTopics.system },
      { role: 'user', content: prompts.brainstormTopics.user(input) },
    ],
  });
  const data = parseJson<{ candidates?: TopicCandidate[] }>(result.text);
  const candidates = Array.isArray(data.candidates)
    ? data.candidates.filter((c) => c.workingTitle && c.intent && c.format).slice(0, 12)
    : [];
  return { candidates, provider: result.provider };
}
