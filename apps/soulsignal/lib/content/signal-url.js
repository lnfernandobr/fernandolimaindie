/**
 * Builds a kind-based URL for a signal.
 *   psalm      → /salmo/{numero}         (slug: salmo-{numero})
 *   devotional → /devocional/{rest}      (slug: devocional-{rest})
 *   everything else → /oracao/{rest}     (slug: oracao-{rest})
 *
 * Works with both full signalSchema and signalSummarySchema objects.
 */
export const signalUrl = (signal) => {
  const { kind, slug } = signal;
  if (kind === 'psalm') return `/salmo/${slug.replace(/^salmo-/, '')}`;
  if (kind === 'devotional') return `/devocional/${slug.replace(/^devocional-/, '')}`;
  return `/oracao/${slug.replace(/^oracao-/, '')}`;
};
