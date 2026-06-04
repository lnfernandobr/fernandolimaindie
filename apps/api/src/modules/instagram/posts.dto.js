const toSlide = (s) => ({
  index: s.index,
  role: s.role ?? 'body',
  text: s.text ?? '',
  imageSubject: s.imageSubject ?? '',
  imageScene: s.imageScene ?? '',
  imagePrompt: s.imagePrompt ?? '',
  imageUrl: s.imageUrl,
});

const toHashtagTiers = (tiers) => ({
  high: tiers?.high ?? [],
  medium: tiers?.medium ?? [],
  low: tiers?.low ?? [],
});

const toVideoVariant = (v) => ({
  status: v?.status ?? 'idle',
  url: v?.url ?? null,
  durationMs: v?.durationMs ?? 0,
  scenes: v?.scenes ?? 0,
  error: v?.error ?? null,
  generatedAt: v?.generatedAt ?? null,
});

const toVideo = (video) => ({
  short: toVideoVariant(video?.short),
  long: toVideoVariant(video?.long),
});

const toVisualAnchors = (anchors) => ({
  medium: anchors?.medium ?? '',
  palette: anchors?.palette ?? '',
  lighting: anchors?.lighting ?? '',
  lensOrTechnique: anchors?.lensOrTechnique ?? '',
  composition: anchors?.composition ?? '',
  texture: anchors?.texture ?? '',
  reference: anchors?.reference ?? '',
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
        designConcept: doc.designConcept ?? '',
        visualStyle: doc.visualStyle ?? '',
        visualAnchors: toVisualAnchors(doc.visualAnchors),
        slides: (doc.slides ?? []).map(toSlide),
        caption: doc.caption ?? '',
        hashtags: doc.hashtags ?? [],
        hashtagTiers: toHashtagTiers(doc.hashtagTiers),
        coverImageUrl: doc.coverImageUrl ?? null,
        video: toVideo(doc.video),
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
        videoShortStatus: doc.video?.short?.status ?? 'idle',
        videoLongStatus: doc.video?.long?.status ?? 'idle',
        createdAt: doc.createdAt,
      };
