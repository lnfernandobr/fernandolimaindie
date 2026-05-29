import { INTENT_KEYS } from '../../constants/soulsignal.js';

const pickRelated = (intent) =>
  INTENT_KEYS.filter((k) => k !== intent).slice(0, 2);

const titleFor = (seed) => {
  if (seed.seedKind === 'psalm') {
    const n = seed.subject.psalmNumber ?? '?';
    return `Salmo ${n} — ${seed.subject.theme ?? 'reflexao'}`;
  }
  if (seed.seedKind === 'saint-prayer') return `Oracao a ${seed.subject.saintName ?? 'santo'} — intercessao`;
  if (seed.seedKind === 'intent-prayer') return `Oracao para ${seed.subject.focus ?? seed.intent} — pra rezar agora`;
  return `Devocional — ${seed.subject.theme ?? 'reflexao do dia'}`;
};

export const buildMockContent = (seed) => ({
  title: titleFor(seed),
  answer:
    'Conteudo de teste gerado em modo mock. Substitua configurando OPENAI_API_KEY e desligando OPENAI_MOCK_MODE.',
  summary:
    'Resumo de teste gerado em mock mode. Isto eh um placeholder valido para validar o pipeline sem chamar a OpenAI.',
  bodyHtml:
    '<p>Conteudo de corpo em modo mock. Este texto existe apenas para que o pipeline de geracao possa ser testado end-to-end sem custo de API.</p><p>Use este modo durante desenvolvimento. Em producao, garanta que <strong>OPENAI_MOCK_MODE</strong> esteja em <em>false</em> e que a chave esteja configurada.</p>',
  chunks: [
    {
      id: 'ancora',
      html: '<p><strong>Ancora do tema.</strong></p><p>Trecho mock para representar um chunk semantico autocontido. Em producao, vira da OpenAI.</p>',
    },
    {
      id: 'pratica',
      html: '<p><strong>Pratica do dia.</strong></p><p>Outro trecho mock. Demonstra que o pipeline aceita multiplos chunks com ids slug curtos.</p>',
    },
  ],
  faq: [
    {
      question: 'Isto eh conteudo real?',
      answer: 'Nao. Isto eh saida do gerador em modo mock. Configure OPENAI_API_KEY para gerar conteudo real.',
    },
    {
      question: 'Como ativar o gerador real?',
      answer: 'Defina OPENAI_MOCK_MODE=false e tenha OPENAI_API_KEY no ambiente (Doppler em prod).',
    },
  ],
  relatedIntents: pickRelated(seed.intent),
});
