import { prompts, type BrainstormTopicsInput } from '../prompts.js';
import { getTextProvider } from '../providers/index.js';
import { brainstormTopicsSchema, type TopicCandidate } from '../schemas.js';

export interface BrainstormResult {
  candidates: TopicCandidate[];
  provider: string;
}

export async function brainstormTopics(input: BrainstormTopicsInput): Promise<BrainstormResult> {
  const provider = await getTextProvider();
  const { data, provider: providerName } = await provider.generateStructured({
    schemaName: 'BrainstormTopics',
    schemaDescription: 'Lista de candidatos a tema de post com intent, formato e justificativa.',
    schema: brainstormTopicsSchema,
    messages: [
      { role: 'system', content: prompts.brainstormTopics.system },
      { role: 'user', content: prompts.brainstormTopics.user(input) },
    ],
  });
  return { candidates: data.candidates.slice(0, 12), provider: providerName };
}
