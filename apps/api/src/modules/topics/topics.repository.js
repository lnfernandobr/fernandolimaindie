import { TopicModel } from './topics.model.js';

export const findTopicBySlug = (slug) => TopicModel.findOne({ slug }).lean();

export const listTopics = ({ filter, skip, limit }) =>
  TopicModel.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean();

export const countTopics = (filter) => TopicModel.countDocuments(filter);

export const createTopic = (input) => TopicModel.create(input);

export const updateTopicBySlug = (slug, patch) =>
  TopicModel.findOneAndUpdate({ slug }, patch, { new: true }).lean();
