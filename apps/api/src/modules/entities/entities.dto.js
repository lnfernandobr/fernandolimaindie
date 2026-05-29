export const toPublicEntity = (doc) =>
  doc === null || doc === undefined
    ? null
    : {
        id: String(doc._id),
        slug: doc.slug,
        name: doc.name,
        kind: doc.kind,
        description: doc.description,
        synonyms: doc.synonyms ?? [],
        imageUrl: doc.imageUrl ?? null,
        lang: doc.lang,
        updatedAt: doc.updatedAt,
      };

export const toEntitySummary = (doc) =>
  doc === null || doc === undefined
    ? null
    : {
        slug: doc.slug,
        name: doc.name,
        kind: doc.kind,
        imageUrl: doc.imageUrl ?? null,
      };
