import { EntityModel } from './entities.model.js';

export const findEntityBySlug = (slug) => EntityModel.findOne({ slug }).lean();

export const listEntities = ({ filter, skip, limit }) =>
  EntityModel.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean();

export const countEntities = (filter) => EntityModel.countDocuments(filter);

export const createEntity = (input) => EntityModel.create(input);

export const updateEntityBySlug = (slug, patch) =>
  EntityModel.findOneAndUpdate({ slug }, patch, { new: true }).lean();
