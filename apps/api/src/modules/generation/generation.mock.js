import { INTENT_KEYS, LIMITS } from '../../constants/content.js';

const pickRelated = (intent) =>
  INTENT_KEYS.filter((k) => k !== intent).slice(0, 2);

const clamp = (str, max) => (str && str.length > max ? `${str.slice(0, max - 1)}…` : str);

const titleFor = (seed) => {
  const t = seed.subject?.title;
  if (t) return clamp(t, LIMITS.TITLE_MAX);
  const kw = seed.subject?.keyword ?? seed.intent;
  return clamp(`${kw} — conteúdo de teste`, LIMITS.TITLE_MAX);
};

const briefText = (seed, fallback) => clamp(seed.subject?.brief || fallback, LIMITS.SUMMARY_MAX);

const mockVerses = (seed) => {
  const refs = Array.isArray(seed.subject?.verseRefs) && seed.subject.verseRefs.length
    ? seed.subject.verseRefs
    : ['Salmo 23, 1', 'João 3, 16', 'Filipenses 4, 13'];
  return refs.slice(0, LIMITS.VERSES_MAX).map((ref) => ({
    ref,
    text: `Texto mock do versículo ${ref}. Em produção, vem da OpenAI com a tradução de uso comum no Brasil.`,
  }));
};

/**
 * Conteudo de teste (OPENAI_MOCK_MODE=true). Produz uma saida valida para o
 * generatedContentSchema de cada signalKind, sem chamar a OpenAI.
 */
export const buildMockContent = (seed) => {
  const answer = clamp(
    briefText(seed, 'Conteudo de teste gerado em modo mock.'),
    LIMITS.ANSWER_MAX,
  );
  const summary = briefText(seed, 'Resumo de teste gerado em mock mode, placeholder valido do pipeline.');
  const base = {
    title: titleFor(seed),
    answer,
    summary,
    bodyHtml:
      '<p>Conteudo de corpo em modo mock. Existe apenas para testar o pipeline end-to-end sem custo de API.</p><p>Em producao, garanta <strong>OPENAI_MOCK_MODE=false</strong> e a chave configurada.</p>',
    imagePrompt:
      'torn bread on a worn wooden table beside a sunlit window, cinematic morning light, warm intentional palette, shallow depth of field, no text',
    chunks: [
      { id: 'ancora', html: '<p><strong>Ancora do tema.</strong></p><p>Trecho mock semantico autocontido.</p>' },
      { id: 'pratica', html: '<p><strong>Pratica do dia.</strong></p><p>Outro trecho mock com id slug curto.</p>' },
    ],
    faq: [
      { question: 'Isto eh conteudo real?', answer: 'Nao. Eh saida do gerador em modo mock.' },
      { question: 'Como ativar o gerador real?', answer: 'Defina OPENAI_MOCK_MODE=false e tenha OPENAI_API_KEY no ambiente.' },
    ],
    relatedIntents: pickRelated(seed.intent),
  };

  if (seed.signalKind === 'verse_collection') {
    return { ...base, verses: mockVerses(seed), chunks: [] };
  }
  if (seed.signalKind === 'article') {
    return { ...base, category: seed.subject?.category ?? 'vida-crista' };
  }
  return base;
};
