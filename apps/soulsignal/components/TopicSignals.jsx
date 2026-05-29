import { listSignals } from '@/lib/content/api.js';
import { keyToSlug } from '@/lib/content/intents.js';

export async function TopicSignals({ topicSlug, excludeSlug }) {
  let items = [];
  try {
    const result = await listSignals({ topicSlug, limit: 6 });
    items = result.items.filter((s) => s.slug !== excludeSlug);
  } catch {
    return null;
  }
  if (!items.length) return null;

  return (
    <section id="topic-signals" className="chunk" aria-label="Neste tópico">
      <p className="section-caption">Neste tópico</p>
      <ul className="topic-list">
        {items.map((signal) => (
          <li key={signal.slug}>
            <a href={`/${keyToSlug(signal.intent)}/${signal.slug}`}>
              {signal.title}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
