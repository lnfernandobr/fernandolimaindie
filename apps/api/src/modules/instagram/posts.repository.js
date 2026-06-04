import { InstagramPostModel } from './posts.model.js';

export const createPost = (input) => InstagramPostModel.create(input);

export const findPostById = (id) => InstagramPostModel.findById(id).lean();

export const listPostsByChannel = ({ channelId, skip, limit }) =>
  InstagramPostModel.find({ channelId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

export const countPostsByChannel = (channelId) =>
  InstagramPostModel.countDocuments({ channelId });

export const updatePostVideo = (id, patch) => {
  const set = Object.fromEntries(Object.entries(patch).map(([k, v]) => [`video.${k}`, v]));
  return InstagramPostModel.findByIdAndUpdate(id, { $set: set }, { new: true }).lean();
};
