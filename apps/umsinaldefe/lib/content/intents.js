export const INTENT_SLUGS = {
  anxiety: 'ansiedade',
  sleep: 'sono',
  fear: 'medo',
  gratitude: 'gratidao',
  protection: 'protecao',
  faith: 'fe',
  hope: 'esperanca',
  family: 'familia',
  finances: 'financas',
  grief: 'luto',
  morning: 'manha',
  night: 'noite',
  healing: 'cura',
  forgiveness: 'perdao',
};

export const INTENT_LABELS = {
  anxiety: 'Ansiedade',
  sleep: 'Sono',
  fear: 'Medo',
  gratitude: 'Gratidão',
  protection: 'Proteção',
  faith: 'Fé',
  hope: 'Esperança',
  family: 'Família',
  finances: 'Finanças',
  grief: 'Luto',
  morning: 'Manhã',
  night: 'Noite',
  healing: 'Cura',
  forgiveness: 'Perdão',
};

export const INTENT_DESCRIPTIONS = {
  anxiety: 'Orações curtas, salmos e respirações pra acalmar o coração quando a ansiedade aperta.',
  sleep: 'Orações da noite pra dormir em paz, agradecer pelo dia e entregar amanhã.',
  fear: 'Salmos e orações pra momentos de medo — pra si e por quem você ama.',
  gratitude: 'Devocionais e orações de agradecimento pra começar e terminar o dia.',
  protection: 'Salmos, orações e devocionais pra pedir proteção pra você, sua casa e quem você ama.',
  faith: 'Orações, reflexões e versículos pra fortalecer a fé nos momentos de dúvida.',
  hope: 'Versículos e reflexões pra dias em que você precisa encontrar esperança.',
  family: 'Orações pela família, pelos filhos, pelo casamento e pela casa.',
  finances: 'Orações e reflexões pra lidar com preocupações financeiras com fé.',
  grief: 'Orações de consolo e salmos pra momentos de perda e luto.',
  morning: 'Orações da manhã pra começar o dia com fé, gratidão e disposição.',
  night: 'Orações da noite, salmos pra dormir e reflexões antes de descansar.',
  healing: 'Orações de cura física, emocional e espiritual.',
  forgiveness: 'Orações sobre perdão — pra pedir, pra receber e pra conceder.',
};

const slugToKeyMap = Object.fromEntries(
  Object.entries(INTENT_SLUGS).map(([k, v]) => [v, k])
);

export const keyToSlug = (key) => INTENT_SLUGS[key] ?? key;

export const slugToKey = (slug) => slugToKeyMap[slug] ?? null;
