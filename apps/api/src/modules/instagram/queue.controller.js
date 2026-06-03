import { HTTP_STATUS } from '../../constants/http.js';
import {
  channelIdParamSchema,
  createQueueItemSchema,
  listQueueQuerySchema,
  queueItemParamSchema,
  updateQueueItemSchema,
} from './queue.schema.js';
import {
  addQueueItem,
  listChannelQueue,
  removeQueueItem,
  updateQueueItem,
} from './queue.service.js';
import { startPostGeneration } from './generation.pipeline.js';

export const handleListQueue = async (req, res) => {
  const { channelId } = channelIdParamSchema.parse(req.params);
  const query = listQueueQuerySchema.parse(req.query);
  const result = await listChannelQueue(channelId, query);
  res.status(HTTP_STATUS.OK).json(result);
};

export const handleCreateQueueItem = async (req, res) => {
  const { channelId } = channelIdParamSchema.parse(req.params);
  const input = createQueueItemSchema.parse(req.body);
  const item = await addQueueItem(channelId, input);
  res.status(HTTP_STATUS.CREATED).json(item);
};

export const handleUpdateQueueItem = async (req, res) => {
  const { channelId, itemId } = queueItemParamSchema.parse(req.params);
  const patch = updateQueueItemSchema.parse(req.body);
  const item = await updateQueueItem(channelId, itemId, patch);
  res.status(HTTP_STATUS.OK).json(item);
};

export const handleDeleteQueueItem = async (req, res) => {
  const { channelId, itemId } = queueItemParamSchema.parse(req.params);
  const result = await removeQueueItem(channelId, itemId);
  res.status(HTTP_STATUS.OK).json(result);
};

export const handleRunQueueItem = async (req, res) => {
  const { channelId, itemId } = queueItemParamSchema.parse(req.params);
  const result = await startPostGeneration({ channelId, itemId });
  res.status(HTTP_STATUS.ACCEPTED).json(result);
};
