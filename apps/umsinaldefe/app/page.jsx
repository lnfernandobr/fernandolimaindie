import { buildMetadata } from '../lib/seo/metadata.js';
import { faqLd, speakableLd, ldGraph, jsonLdScript } from '../lib/seo/jsonld.js';

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
    answer:
      'Não. O Um Sinal de Fé é gratuito. O site é mantido por anúncios discretos.',
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

const pageGraph = ldGraph(faqLd(FAQ), speakableLd(['#answer', '#summary']));

export default function HomePage() {
  return (
    <>
      <script {...jsonLdScript(pageGraph)} />
      <main>
        <h1>Um sinal de fé todo dia.</h1>
        <p className="lede">
          Salmos, orações e devocionais curtos pra te acompanhar nos momentos
          que importam — em português, simples, todo dia.
        </p>

        <section className="answer" id="answer" aria-labelledby="answer-h">
          <h2 id="answer-h">o que é o Um Sinal de Fé</h2>
          <p>
            Um devocional cristão diário em português. Salmos, orações por
            intenção (ansiedade, sono, proteção, gratidão, fé) e versículos
            curtos pra te acompanhar todo dia.
          </p>
        </section>

        <section className="chunk" id="summary" aria-labelledby="summary-h">
          <h2 id="summary-h">como funciona</h2>
          <p>
            Todo dia tem um devocional novo. Você também pode buscar por
            <em> intenção</em> — oração pra dormir em paz, salmo de proteção
            pra família, versículo pra ansiedade — e ouvir em áudio se
            preferir. Salva o que te tocou. Volta amanhã.
          </p>
        </section>

        <section className="chunk" aria-labelledby="hubs-h">
          <h2 id="hubs-h">por onde começar</h2>
          <ul>
            <li><a href="/devocional">devocional do dia</a> — uma pausa curta com leitura, reflexão e oração</li>
            <li><a href="/salmo/91">salmo 91</a> — o salmo da proteção, comentado e em áudio</li>
            <li><a href="/oracao/para-ansiedade">oração pra ansiedade</a> — pra quando o coração aperta</li>
            <li><a href="/oracao/para-dormir-em-paz">oração pra dormir</a> — pra encerrar o dia em paz</li>
            <li><a href="/oracao/a-santo-judas-tadeu">oração a Santo Judas Tadeu</a> — causas difíceis</li>
          </ul>
        </section>

        <section className="chunk" aria-labelledby="faq-h">
          <h2 id="faq-h">perguntas que recebemos</h2>
          {FAQ.map((q) => (
            <details key={q.question} style={{ marginBottom: 12 }}>
              <summary style={{ fontWeight: 600, cursor: 'pointer' }}>
                {q.question}
              </summary>
              <p style={{ marginTop: 8 }}>{q.answer}</p>
            </details>
          ))}
        </section>
      </main>
    </>
  );
}
