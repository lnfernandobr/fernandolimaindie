import { conflict, notFound } from '../../errors/factories.js';
import { INSTAGRAM_ERRORS } from '../../constants/instagram.js';
import {
  countChannels,
  createChannel as insertChannel,
  deleteChannelById,
  findChannelById,
  findChannelByHandle,
  listChannels as queryListChannels,
  updateChannelById,
} from './channels.repository.js';
import { toPublicChannel } from './channels.dto.js';

const MONGO_DUPLICATE_KEY = 11000;

export const ensureChannelById = async (channelId) => {
  const doc = await findChannelById(channelId);
  if (!doc) throw notFound(INSTAGRAM_ERRORS.CHANNEL_NOT_FOUND);
  return doc;
};

export const getChannelById = async (channelId) => {
  const doc = await ensureChannelById(channelId);
  return toPublicChannel(doc);
};

export const listChannels = async ({ page, limit }) => {
  const skip = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    queryListChannels({ skip, limit }),
    countChannels(),
  ]);
  return {
    items: docs.map(toPublicChannel),
    page,
    limit,
    total,
    pages: Math.ceil(total / limit) || 1,
  };
};

export const createChannel = async (input) => {
  const existing = await findChannelByHandle(input.handle);
  if (existing) throw conflict(INSTAGRAM_ERRORS.CHANNEL_HANDLE_TAKEN);
  try {
    const created = await insertChannel(input);
    return toPublicChannel(created.toObject());
  } catch (err) {
    if (err?.code === MONGO_DUPLICATE_KEY) throw conflict(INSTAGRAM_ERRORS.CHANNEL_HANDLE_TAKEN);
    throw err;
  }
};

export const updateChannel = async (channelId, patch) => {
  if (patch.handle) {
    const dup = await findChannelByHandle(patch.handle);
    if (dup && String(dup._id) !== channelId) {
      throw conflict(INSTAGRAM_ERRORS.CHANNEL_HANDLE_TAKEN);
    }
  }
  const updated = await updateChannelById(channelId, patch);
  if (!updated) throw notFound(INSTAGRAM_ERRORS.CHANNEL_NOT_FOUND);
  return toPublicChannel(updated);
};

export const deleteChannel = async (channelId) => {
  const removed = await deleteChannelById(channelId);
  if (!removed) throw notFound(INSTAGRAM_ERRORS.CHANNEL_NOT_FOUND);
  return { id: channelId, deleted: true };
};
