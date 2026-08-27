import { buildMetadata } from '../lib/seo/metadata.js';
import { faqLd, speakableLd, ldGraph, jsonLdScript } from '../lib/seo/jsonld.js';
import { Hero } from '../components/Hero.jsx';
import { Intentions } from '../components/Intentions.jsx';
import { FeaturedPsalms } from '../components/FeaturedPsalms.jsx';
import { PrayersList } from '../components/PrayersList.jsx';
import { listSignals } from '../lib/content/api.js';
import { getVerseOfDay } from '../lib/content/verse-of-day.js';

export const metadata = buildMetadata({
  title: 'Um Sinal de Fé: devocional diário, salmos e orações em português',
  description:
    'Um devocional curto todo dia. Salmos, orações por intenção e versículos pra te acompanhar em momentos de fé, ansiedade, sono e gratidão. Em português, simples, todo dia.',
  path: '/',
});

const FAQ = [
  {
    question: 'O que é o Um Sinal de Fé?',
    answer:
      'O Um Sinal de Fé é um devocional cristão diário em português. Cada dia você encontra um salmo, uma oração curta e um versículo pra acompanhar momentos como ansiedade, sono, proteção, gratidão e fé.',
  },
  {
    question: 'Preciso pagar?',
    answer: 'Não. O Um Sinal de Fé é gratuito. O site é mantido por anúncios discretos.',
  },
  {
    question: 'É de alguma igreja específica?',
    answer:
      'Não. O Um Sinal de Fé é interconfessional cristão, com conteúdo respeitoso à tradição católica e cristã em geral, em linguagem brasileira simples.',
  },
];

const pageGraph = ldGraph(faqLd(FAQ), speakableLd(['#devocional', '#intencoes']));

export const revalidate = 86400;

export default async function HomePage() {
  // Tudo vem da API. Só renderiza o que existe (nada de conteúdo estático ou link morto).
  let verse = null;
  let psalms = [];
  let prayers = [];
  try {
    verse = await getVerseOfDay();
  } catch {
    // sem versículo ainda: hero mostra a casca de boas-vindas
  }
  try {
    psalms = (await listSignals({ kind: 'psalm', limit: 7 })).items;
  } catch {
    // API indisponível / sem conteúdo: a seção some
  }
  try {
    prayers = (await listSignals({ kind: 'prayer', limit: 6 })).items;
  } catch {
    // idem
  }

  return (
    <>
      <script {...jsonLdScript(pageGraph)} />
      <Hero verse={verse} />
      <Intentions />
      {psalms.length > 0 && <FeaturedPsalms psalms={psalms} />}
      {prayers.length > 0 && <PrayersList prayers={prayers} />}
      {/* Formulário de inscrição escondido por enquanto (reativar: <SubscribeForm />). */}
    </>
  );
}
