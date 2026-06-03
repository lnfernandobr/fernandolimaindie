const MOCK_BODY_TEXTS = [
  'Comece pelo problema, não pela solução.',
  'Estrutura clara vence criatividade solta.',
  'Repete o ponto-chave. Memória curta.',
  'Detalhe concreto para o polegar.',
  'Analogia curta fixa o conceito.',
];

const MOCK_BODY_SCENES = [
  'a single ripe orange resting on a marble surface, soft side light, minimalist still life',
  'an empty wooden chair beside a sunlit window, calm morning atmosphere',
  'a pair of running shoes on a wet asphalt road, early dawn light, motion-blurred horizon',
  'two ceramic cups facing each other on a linen tablecloth, warm afternoon glow',
  'a small green plant breaking through cracked concrete, soft natural light, gritty texture',
];

const pickBody = (count) => {
  const out = [];
  for (let i = 0; i < count; i += 1) {
    out.push({
      role: 'body',
      text: MOCK_BODY_TEXTS[i % MOCK_BODY_TEXTS.length],
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
      imageScene: 'a single dramatic spotlight on a velvet stage curtain, deep saturated colors',
    },
    ...pickBody(middle),
    {
      role: 'cta',
      text: 'Salva esse post e marca quem precisa ver.',
      imageScene: 'an open hand reaching upward against a sunrise sky, gentle warm gradient',
    },
  ];
  return {
    title: topic,
    slides,
    caption: `${topic}\n\nConteúdo curado por @${channel.handle}. Salva pra revisitar.`,
    hashtags: channel.hashtagsPool?.length
      ? channel.hashtagsPool.slice(0, 10)
      : ['#conteudo', '#dicas', '#brasil'],
  };
};

const placeholderPalette = (channel) => ({
  bg: (channel.brandBg || '#0F172A').replace('#', ''),
  fg: (channel.brandFg || '#F8FAFC').replace('#', ''),
});

export const mockSlideImageUrl = ({ channel, slideNumber }) => {
  const { bg, fg } = placeholderPalette(channel);
  return `https://placehold.co/1024x1024/${bg}/${fg}?text=slide+${slideNumber}`;
};
