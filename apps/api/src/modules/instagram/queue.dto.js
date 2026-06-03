const toLogEntry = (e) => ({
  step: e.step,
  label: e.label ?? '',
  status: e.status,
  durationMs: e.durationMs ?? 0,
  message: e.message ?? '',
  at: e.at,
});

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
        runDurationMs: doc.runDurationMs ?? 0,
        runLog: (doc.runLog ?? []).map(toLogEntry),
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
