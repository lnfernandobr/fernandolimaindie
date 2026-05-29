import { getEntity } from '@/lib/content/api.js';

const resolveEntities = async (slugs) => {
  const results = await Promise.allSettled(slugs.map((s) => getEntity(s)));
  return results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);
};

export async function EntityLinks({ entitySlugs }) {
  if (!entitySlugs?.length) return null;

  let entities = [];
  try {
    entities = await resolveEntities(entitySlugs);
  } catch {
    return null;
  }
  if (!entities.length) return null;

  return (
    <section id="entities" className="chunk" aria-label="Presença de">
      <p className="section-caption">Presença de:</p>
      <div className="entity-chips">
        {entities.map((entity) => (
          <a
            key={entity.slug}
            href={`/entidade/${entity.slug}`}
            className="entity-chip"
          >
            {entity.name}
          </a>
        ))}
      </div>
    </section>
  );
}
