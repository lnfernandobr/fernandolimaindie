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
        imagePrompt: doc.imagePrompt ?? '',
        slidesPerCarousel: doc.slidesPerCarousel,
        hashtagsPool: doc.hashtagsPool ?? [],
        brandBg: doc.brandBg,
        brandFg: doc.brandFg,
        brandAccent: doc.brandAccent,
        active: doc.active,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
