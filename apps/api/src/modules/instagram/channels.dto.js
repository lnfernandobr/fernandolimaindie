export const toPublicChannel = (doc) =>
  doc === null || doc === undefined
    ? null
    : {
        id: String(doc._id),
        handle: doc.handle,
        displayName: doc.displayName,
        niche: doc.niche ?? '',
        brief: doc.brief ?? '',
        tone: doc.tone ?? '',
        captionStyle: doc.captionStyle ?? '',
        slidesPerCarousel: doc.slidesPerCarousel,
        active: doc.active,
        autoVideo: doc.autoVideo ?? false,
        videoVariant: doc.videoVariant ?? 'short',
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
