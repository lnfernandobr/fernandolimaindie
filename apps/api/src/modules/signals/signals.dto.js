export const toPublicSignal = (doc) =>
  doc === null || doc === undefined
    ? null
    : {
        id: String(doc._id),
        slug: doc.slug,
        kind: doc.kind,
        intent: doc.intent,
        topicSlug: doc.topicSlug,
        entitySlugs: doc.entitySlugs ?? [],
        title: doc.title,
        answer: doc.answer,
        summary: doc.summary,
        bodyHtml: doc.bodyHtml,
        chunks: doc.chunks ?? [],
        faq: doc.faq ?? [],
        relatedIntents: doc.relatedIntents ?? [],
        audioUrl: doc.audioUrl ?? null,
        imageUrl: doc.imageUrl ?? null,
        lang: doc.lang,
        status: doc.status,
        publishedAt: doc.publishedAt,
        updatedAt: doc.updatedAt,
      };

export const toSignalSummary = (doc) =>
  doc === null || doc === undefined
    ? null
    : {
        slug: doc.slug,
        kind: doc.kind,
        intent: doc.intent,
        topicSlug: doc.topicSlug,
        title: doc.title,
        answer: doc.answer,
        imageUrl: doc.imageUrl ?? null,
        audioUrl: doc.audioUrl ?? null,
        publishedAt: doc.publishedAt,
      };
