export function SemanticChunks({ chunks }) {
  if (!chunks?.length) return null;
  return chunks.map((chunk) => (
    <section key={chunk.id} id={chunk.id} className="chunk">
      <div dangerouslySetInnerHTML={{ __html: chunk.html }} />
    </section>
  ));
}
