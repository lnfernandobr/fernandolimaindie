export const toPublicTopic = (doc) =>
  doc === null || doc === undefined
    ? null
    : {
        id: String(doc._id),
        slug: doc.slug,
        name: doc.name,
        intent: doc.intent,
        description: doc.description,
        answer: doc.answer,
        bodyHtml: doc.bodyHtml ?? '',
        relatedTopicSlugs: doc.relatedTopicSlugs ?? [],
        heroImageUrl: doc.heroImageUrl ?? null,
        lang: doc.lang,
        updatedAt: doc.updatedAt,
      };

export const toTopicSummary = (doc) =>
  doc === null || doc === undefined
    ? null
    : {
        slug: doc.slug,
        name: doc.name,
        intent: doc.intent,
        description: doc.description,
        heroImageUrl: doc.heroImageUrl ?? null,
      };
