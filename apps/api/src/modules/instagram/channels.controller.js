import { HTTP_STATUS } from '../../constants/http.js';
import {
  channelIdParamSchema,
  createChannelSchema,
  listChannelsQuerySchema,
  updateChannelSchema,
} from './channels.schema.js';
import {
  createChannel,
  deleteChannel,
  getChannelById,
  listChannels,
  updateChannel,
} from './channels.service.js';

export const handleListChannels = async (req, res) => {
  const query = listChannelsQuerySchema.parse(req.query);
  const result = await listChannels(query);
  res.status(HTTP_STATUS.OK).json(result);
};

export const handleGetChannel = async (req, res) => {
  const { channelId } = channelIdParamSchema.parse(req.params);
  const channel = await getChannelById(channelId);
  res.status(HTTP_STATUS.OK).json(channel);
};

export const handleCreateChannel = async (req, res) => {
  const input = createChannelSchema.parse(req.body);
  const channel = await createChannel(input);
  res.status(HTTP_STATUS.CREATED).json(channel);
};

export const handleUpdateChannel = async (req, res) => {
  const { channelId } = channelIdParamSchema.parse(req.params);
  const patch = updateChannelSchema.parse(req.body);
  const channel = await updateChannel(channelId, patch);
  res.status(HTTP_STATUS.OK).json(channel);
};

export const handleDeleteChannel = async (req, res) => {
  const { channelId } = channelIdParamSchema.parse(req.params);
  const result = await deleteChannel(channelId);
  res.status(HTTP_STATUS.OK).json(result);
};
