export function SemanticFAQ({ entries }) {
  if (!entries?.length) return null;
  return (
    <section id="faq" className="chunk" aria-label="Perguntas frequentes">
      <h2>Perguntas frequentes</h2>
      {entries.map((entry, i) => (
        <details key={i}>
          <summary>{entry.question}</summary>
          <p>{entry.answer}</p>
        </details>
      ))}
    </section>
  );
}
