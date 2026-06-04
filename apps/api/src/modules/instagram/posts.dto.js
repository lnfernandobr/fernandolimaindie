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

const toVideo = (video) => ({
  status: video?.status ?? 'idle',
  verticalUrl: video?.verticalUrl ?? null,
  squareUrl: video?.squareUrl ?? null,
  narrationUrl: video?.narrationUrl ?? null,
  durationMs: video?.durationMs ?? 0,
  error: video?.error ?? null,
  generatedAt: video?.generatedAt ?? null,
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
        videoStatus: doc.video?.status ?? 'idle',
        createdAt: doc.createdAt,
      };
