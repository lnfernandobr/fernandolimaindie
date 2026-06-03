import { InstagramQueueItemModel } from './queue.model.js';

export const createQueueItem = (input) => InstagramQueueItemModel.create(input);

export const findQueueItemById = (id) => InstagramQueueItemModel.findById(id).lean();

export const listQueueItemsByChannel = (channelId) =>
  InstagramQueueItemModel.find({ channelId })
    .sort({ priority: 1, createdAt: 1 })
    .lean();

export const minPriorityForChannel = async (channelId) => {
  const top = await InstagramQueueItemModel.findOne({ channelId })
    .sort({ priority: 1 })
    .select({ priority: 1 })
    .lean();
  return top?.priority ?? null;
};

export const maxPriorityForChannel = async (channelId) => {
  const bottom = await InstagramQueueItemModel.findOne({ channelId })
    .sort({ priority: -1 })
    .select({ priority: 1 })
    .lean();
  return bottom?.priority ?? null;
};

export const updateQueueItemById = (id, patch) =>
  InstagramQueueItemModel.findByIdAndUpdate(id, patch, { new: true }).lean();

export const pushRunLogEntry = (id, entry, runDurationMs) =>
  InstagramQueueItemModel.findByIdAndUpdate(
    id,
    { $push: { runLog: entry }, $set: { runDurationMs } },
    { new: true },
  ).lean();

export const deleteQueueItemById = (id) =>
  InstagramQueueItemModel.findByIdAndDelete(id).lean();

export const findNeighbor = ({ channelId, priority, direction }) => {
  const sortDir = direction === 'up' ? -1 : 1;
  const op = direction === 'up' ? '$lt' : '$gt';
  return InstagramQueueItemModel.findOne({ channelId, priority: { [op]: priority } })
    .sort({ priority: sortDir })
    .lean();
};
