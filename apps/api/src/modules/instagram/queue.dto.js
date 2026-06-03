export const toPublicQueueItem = (doc) =>
  doc === null || doc === undefined
    ? null
    : {
        id: String(doc._id),
        channelId: String(doc.channelId),
        topic: doc.topic,
        brief: doc.brief ?? '',
        priority: doc.priority,
        status: doc.status,
        scheduledFor: doc.scheduledFor,
        postId: doc.postId ? String(doc.postId) : null,
        error: doc.error ?? null,
        generationStartedAt: doc.generationStartedAt,
        generationFinishedAt: doc.generationFinishedAt,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
