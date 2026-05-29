import { INTENT_SLUGS, INTENT_LABELS } from '@/lib/content/intents.js';

export function IntentNav({ currentKey }) {
  const intents = Object.entries(INTENT_SLUGS).filter(([key]) => key !== currentKey);

  return (
    <nav id="intent-nav" aria-label="Outras intenções" className="intent-nav">
      <p className="section-caption">Explore também:</p>
      <div className="intent-chips">
        {intents.map(([key, slug]) => (
          <a key={key} href={`/${slug}`} className="tag intent-tag">
            {INTENT_LABELS[key]}
          </a>
        ))}
      </div>
    </nav>
  );
}
