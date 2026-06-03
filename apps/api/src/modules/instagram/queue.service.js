import { notFound } from '../../errors/factories.js';
import {
  INSTAGRAM_ERRORS,
  INSTAGRAM_QUEUE_ACTIONS,
  INSTAGRAM_QUEUE_STATUS,
} from '../../constants/instagram.js';
import { ensureChannelById } from './channels.service.js';
import {
  createQueueItem as insertQueueItem,
  deleteQueueItemById,
  findNeighbor,
  findQueueItemById,
  listQueueItemsByChannel,
  maxPriorityForChannel,
  minPriorityForChannel,
  pushRunLogEntry,
  updateQueueItemById,
} from './queue.repository.js';
import { toPublicQueueItem } from './queue.dto.js';

const PRIORITY_STEP = 100;

const nextPriorityForChannel = async (channelId) => {
  const max = await maxPriorityForChannel(channelId);
  return (max ?? 0) + PRIORITY_STEP;
};

const ensureItemBelongsToChannel = (item, channelId) => {
  if (!item) throw notFound(INSTAGRAM_ERRORS.QUEUE_ITEM_NOT_FOUND);
  if (String(item.channelId) !== String(channelId)) {
    throw notFound(INSTAGRAM_ERRORS.QUEUE_ITEM_NOT_FOUND);
  }
};

export const listChannelQueue = async (channelId, { status } = {}) => {
  await ensureChannelById(channelId);
  const docs = await listQueueItemsByChannel(channelId);
  const filtered = status ? docs.filter((d) => d.status === status) : docs;
  return { items: filtered.map(toPublicQueueItem), total: filtered.length };
};

export const addQueueItem = async (channelId, input) => {
  await ensureChannelById(channelId);
  const priority = await nextPriorityForChannel(channelId);
  const created = await insertQueueItem({
    channelId,
    topic: input.topic,
    brief: input.brief,
    scheduledFor: input.scheduledFor ?? null,
    priority,
  });
  return toPublicQueueItem(created.toObject());
};

export const removeQueueItem = async (channelId, itemId) => {
  const existing = await findQueueItemById(itemId);
  ensureItemBelongsToChannel(existing, channelId);
  await deleteQueueItemById(itemId);
  return { id: itemId, deleted: true };
};

const performMove = async (item, direction) => {
  const neighbor = await findNeighbor({
    channelId: item.channelId,
    priority: item.priority,
    direction,
  });
  if (!neighbor) return item;
  const updated = await updateQueueItemById(item._id, { priority: neighbor.priority });
  await updateQueueItemById(neighbor._id, { priority: item.priority });
  return updated;
};

const performRunNow = async (item) => {
  const min = await minPriorityForChannel(item.channelId);
  const target = (min ?? PRIORITY_STEP) - PRIORITY_STEP;
  return updateQueueItemById(item._id, {
    priority: target,
    status: INSTAGRAM_QUEUE_STATUS.PENDING,
    error: null,
  });
};

const performSkip = (item) =>
  updateQueueItemById(item._id, { status: INSTAGRAM_QUEUE_STATUS.SKIP });

const performReactivate = (item) =>
  updateQueueItemById(item._id, {
    status: INSTAGRAM_QUEUE_STATUS.PENDING,
    error: null,
  });

const applyAction = async (item, action) => {
  switch (action) {
    case INSTAGRAM_QUEUE_ACTIONS.UP:
      return performMove(item, 'up');
    case INSTAGRAM_QUEUE_ACTIONS.DOWN:
      return performMove(item, 'down');
    case INSTAGRAM_QUEUE_ACTIONS.RUN_NOW:
      return performRunNow(item);
    case INSTAGRAM_QUEUE_ACTIONS.SKIP:
      return performSkip(item);
    case INSTAGRAM_QUEUE_ACTIONS.REACTIVATE:
      return performReactivate(item);
    default:
      return item;
  }
};

const applyFieldPatch = async (itemId, patch) => {
  const fieldPatch = {};
  if (patch.topic !== undefined) fieldPatch.topic = patch.topic;
  if (patch.brief !== undefined) fieldPatch.brief = patch.brief;
  if (patch.scheduledFor !== undefined) fieldPatch.scheduledFor = patch.scheduledFor;
  if (patch.status !== undefined) fieldPatch.status = patch.status;
  if (Object.keys(fieldPatch).length === 0) return findQueueItemById(itemId);
  return updateQueueItemById(itemId, fieldPatch);
};

export const updateQueueItem = async (channelId, itemId, patch) => {
  const existing = await findQueueItemById(itemId);
  ensureItemBelongsToChannel(existing, channelId);
  let updated = existing;
  if (patch.action) {
    updated = await applyAction(existing, patch.action);
  }
  const afterFields = await applyFieldPatch(itemId, patch);
  return toPublicQueueItem(afterFields ?? updated);
};

export const ensureQueueItem = async (channelId, itemId) => {
  const existing = await findQueueItemById(itemId);
  ensureItemBelongsToChannel(existing, channelId);
  return existing;
};

export const markQueueItem = async (itemId, patch) => updateQueueItemById(itemId, patch);

export const appendQueueItemRunLog = async (itemId, entry, runDurationMs) =>
  pushRunLogEntry(itemId, entry, runDurationMs);
