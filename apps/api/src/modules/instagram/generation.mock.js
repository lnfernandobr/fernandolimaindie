const MOCK_BODY_TEXTS = [
  'Comece pelo problema, não pela solução.',
  'Estrutura clara vence criatividade solta.',
  'Repete o ponto-chave. Memória curta.',
  'Detalhe concreto para o polegar.',
  'Analogia curta fixa o conceito.',
];

const MOCK_BODY_SUBJECTS = [
  'a chipped enamel mug on a worn linen napkin',
  'an empty wooden chair next to a sunlit window frame',
  'a pair of leather running shoes on a wet asphalt road',
  'two ceramic cups facing each other on a linen tablecloth',
  'a single sprouting plant breaking through cracked concrete',
];

const MOCK_BODY_SCENES = [
  'a quiet kitchen at dawn, low side light, dust visible in the air',
  'an empty living room mid-morning, soft northern light through sheer curtains',
  'a deserted backstreet just after rain, reflective puddles, low horizon light',
  'a sun-warmed back porch in late afternoon, faint linen texture catching the light',
  'a gritty urban sidewalk in golden hour, shallow focus on the plant',
];

const slugifyHashtag = (text, suffix = '') =>
  '#' +
  (text || 'tema')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 18) +
  suffix;

const pickBody = (count) => {
  const out = [];
  for (let i = 0; i < count; i += 1) {
    out.push({
      role: 'body',
      text: MOCK_BODY_TEXTS[i % MOCK_BODY_TEXTS.length],
      imageSubject: MOCK_BODY_SUBJECTS[i % MOCK_BODY_SUBJECTS.length],
      imageScene: MOCK_BODY_SCENES[i % MOCK_BODY_SCENES.length],
    });
  }
  return out;
};

export const buildMockPlan = ({ channel, topic, slidesCount }) => {
  const middle = Math.max(0, slidesCount - 2);
  const slides = [
    {
      role: 'hook',
      text: topic,
      imageSubject: 'a single warm spotlight on a dark velvet curtain',
      imageScene: 'a contemplative stage backstage, deep shadow fall-off, low ambient murmur',
    },
    ...pickBody(middle),
    {
      role: 'cta',
      text: 'Salva esse post e marca quem precisa ver.',
      imageSubject: 'an open hand resting on a sun-warmed wooden table',
      imageScene: 'a quiet workshop in late afternoon light, faint dust, warm tone',
    },
  ];
  const slug = slugifyHashtag(topic);
  return {
    title: topic,
    designConcept:
      'Documental analógico em paleta dessaturada, foco em pequenos objetos do cotidiano carregados de simbolismo, inspirado em editoriais da revista Apartamento.',
    visualAnchors: {
      medium: 'documentary photograph on 35mm Kodak Portra 400',
      palette: 'muted sage #8FA68C, warm sand #C9B8A2, ink black #1A1A1A, ivory paper #F2EDE6 — restrained, dusty, melancholic',
      lighting: 'soft window light from camera left, gentle shadow fall-off, slight haze in the air',
      lensOrTechnique: '50mm prime at f/2, shallow depth of field, gentle bokeh, slight halation on highlights',
      composition: 'rule of thirds, subject offset to the right, generous negative space upper-left to host typography',
      texture: 'fine 400-iso film grain, faint dust specks, paper weight visible',
      reference: 'Saul Leiter color street photography meets Apartamento Magazine domestic editorials',
    },
    slides,
    caption: `${topic}\n\nConteúdo curado por @${channel.handle}. Salva pra revisitar.`,
    hashtags: {
      high: ['#instagram', '#conteudo', '#brasil'],
      medium: [slug, '#carrossel', '#dicas', '#aprender'],
      low: [`${slug}br`, `${slug}2026`, `${slug}foco`],
    },
  };
};
