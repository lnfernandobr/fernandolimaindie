import { buildMetadata } from '../lib/seo/metadata.js';
import { faqLd, speakableLd, ldGraph, jsonLdScript } from '../lib/seo/jsonld.js';
import { Hero } from '../components/Hero.jsx';
import { Intentions } from '../components/Intentions.jsx';
import { FeaturedPsalms } from '../components/FeaturedPsalms.jsx';
import { PrayersList } from '../components/PrayersList.jsx';
import { SubscribeForm } from '../components/SubscribeForm.jsx';

export const metadata = buildMetadata({
  title: 'Um Sinal de Fé — devocional diário, salmos e orações em português',
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
    question: 'Tem áudio das orações?',
    answer:
      'Sim. As orações e devocionais têm versão em áudio pra você ouvir enquanto se prepara, dirige ou descansa.',
  },
  {
    question: 'É de alguma igreja específica?',
    answer:
      'Não. O Um Sinal de Fé é interconfessional cristão, com conteúdo respeitoso à tradição católica e cristã em geral, em linguagem brasileira simples.',
  },
];

const pageGraph = ldGraph(faqLd(FAQ), speakableLd(['#devocional', '#intencoes']));

export default function HomePage() {
  return (
    <>
      <script {...jsonLdScript(pageGraph)} />
      <Hero />
      <Intentions />
      <FeaturedPsalms />
      <PrayersList />
      <SubscribeForm />
    </>
  );
}
