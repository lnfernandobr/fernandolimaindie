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
      imageSubject: 'a single white ceramic vase with a fresh eucalyptus sprig',
      imageScene: 'a sunlit white table by a bright window, airy morning light, soft open shadows',
    },
    ...pickBody(middle),
    {
      role: 'cta',
      text: 'Salva esse post e marca quem precisa ver.',
      imageSubject: 'an open hand resting on a sun-warmed wooden table',
      imageScene: 'a bright kitchen in late morning light, fresh and warm, gentle daylight',
    },
  ];
  const slug = slugifyHashtag(topic);
  return {
    title: topic,
    youtubeTitle: topic,
    designConcept:
      'Luz natural clara e arejada, paleta de brancos quentes com verde-sálvia e toques de ocre, para traduzir leveza e recomeço. Pequenos objetos do cotidiano sob luz de manhã, inspirado em editoriais luminosos da revista Kinfolk.',
    visualAnchors: {
      medium: 'natural-light photograph on 35mm Kodak Portra 400',
      palette: 'fresh warm white #F7F5F0, sage green #9CB3A0, soft clay #C58A6A, gentle gold #E7C66B — bright, hopeful, alive',
      lighting: 'bright soft daylight from a large window, open airy shadows, gentle highlights',
      lensOrTechnique: '50mm prime at f/2, shallow depth of field, gentle bokeh',
      composition: 'rule of thirds, subject offset to the right, generous negative space upper-left to host typography',
      texture: 'fine 200-iso film grain, real surface detail, paper weight visible',
      reference: 'Kinfolk magazine light meets Joel Meyerowitz color',
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
