import { getRelatedSignals } from '@/lib/content/api.js';
import { keyToSlug } from '@/lib/content/intents.js';

export async function RelatedSignals({ slug }) {
  let items = [];
  try {
    items = await getRelatedSignals(slug);
  } catch {
    return null;
  }
  if (!items.length) return null;

  return (
    <section id="related" className="chunk" aria-label="Conteúdo relacionado">
      <p className="section-caption">Veja também</p>
      <div className="signal-grid related-grid">
        {items.map((signal) => (
          <a
            key={signal.slug}
            href={`/${keyToSlug(signal.intent)}/${signal.slug}`}
            className="signal-card"
          >
            <h3>{signal.title}</h3>
            <p>{signal.answer}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
