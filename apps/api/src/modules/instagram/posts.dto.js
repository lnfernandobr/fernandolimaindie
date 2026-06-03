const toSlide = (s) => ({
  index: s.index,
  role: s.role ?? 'body',
  text: s.text ?? '',
  imageScene: s.imageScene ?? '',
  imagePrompt: s.imagePrompt ?? '',
  imageUrl: s.imageUrl,
});

export const toPublicPost = (doc) =>
  doc === null || doc === undefined
    ? null
    : {
        id: String(doc._id),
        channelId: String(doc.channelId),
        queueItemId: doc.queueItemId ? String(doc.queueItemId) : null,
        topic: doc.topic,
        title: doc.title ?? '',
        brief: doc.brief ?? '',
        slides: (doc.slides ?? []).map(toSlide),
        caption: doc.caption ?? '',
        hashtags: doc.hashtags ?? [],
        coverImageUrl: doc.coverImageUrl ?? null,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };

export const toPostSummary = (doc) =>
  doc === null || doc === undefined
    ? null
    : {
        id: String(doc._id),
        channelId: String(doc.channelId),
        topic: doc.topic,
        title: doc.title ?? '',
        slideCount: (doc.slides ?? []).length,
        coverImageUrl: doc.coverImageUrl ?? null,
        createdAt: doc.createdAt,
      };
