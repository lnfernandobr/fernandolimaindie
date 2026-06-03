import { logger } from '../config/logger.js';
import { InstagramChannelModel } from '../modules/instagram/channels.model.js';

const LEGACY_FIELDS = ['imagePrompt', 'hashtagsPool', 'brandBg', 'brandFg', 'brandAccent'];

export const bootstrapInstagramCleanup = async () => {
  const filter = { $or: LEGACY_FIELDS.map((field) => ({ [field]: { $exists: true } })) };
  const pending = await InstagramChannelModel.collection.countDocuments(filter);
  if (!pending) return;

  const unset = Object.fromEntries(LEGACY_FIELDS.map((field) => [field, '']));
  const result = await InstagramChannelModel.collection.updateMany(filter, { $unset: unset });
  logger.info(
    { matched: result.matchedCount, modified: result.modifiedCount },
    'instagram channels: legacy fields removed',
  );
};
