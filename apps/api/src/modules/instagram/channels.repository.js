import { InstagramChannelModel } from './channels.model.js';

export const createChannel = (input) => InstagramChannelModel.create(input);

export const findChannelById = (id) => InstagramChannelModel.findById(id).lean();

export const findChannelByHandle = (handle) =>
  InstagramChannelModel.findOne({ handle }).lean();

export const listChannels = ({ skip, limit }) =>
  InstagramChannelModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

export const countChannels = () => InstagramChannelModel.countDocuments();

export const updateChannelById = (id, patch) =>
  InstagramChannelModel.findByIdAndUpdate(id, patch, { new: true }).lean();

export const deleteChannelById = (id) =>
  InstagramChannelModel.findByIdAndDelete(id).lean();
