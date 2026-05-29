export function AnswerFirst({ answer, label = 'Resposta direta' }) {
  return (
    <section id="answer" className="answer">
      <h2>{label}</h2>
      <p>{answer}</p>
    </section>
  );
}
