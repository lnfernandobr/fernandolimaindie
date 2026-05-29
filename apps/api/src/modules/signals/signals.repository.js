import { SignalModel } from './signals.model.js';
import { LIMITS } from '../../constants/soulsignal.js';

const PUBLISHED = 'published';

export const findSignalBySlug = (slug) =>
  SignalModel.findOne({ slug, status: PUBLISHED }).lean();

export const findSignalBySlugAnyStatus = (slug) =>
  SignalModel.findOne({ slug }).lean();

export const listSignals = ({ filter, skip, limit }) =>
  SignalModel.find({ status: PUBLISHED, ...filter })
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

export const countSignals = (filter) =>
  SignalModel.countDocuments({ status: PUBLISHED, ...filter });

export const createSignal = (input) => SignalModel.create(input);

export const updateSignalBySlug = (slug, patch) =>
  SignalModel.findOneAndUpdate({ slug }, patch, { new: true }).lean();

export const findSignalsBySlugs = (slugs) =>
  SignalModel.find({ slug: { $in: slugs }, status: PUBLISHED }).lean();

export const findRelatedSignals = ({ excludeSlug, topicSlug, entitySlugs, intentKeys }) => {
  const orClauses = [{ topicSlug }];
  if (entitySlugs?.length) orClauses.push({ entitySlugs: { $in: entitySlugs } });
  if (intentKeys?.length) orClauses.push({ intent: { $in: intentKeys } });
  return SignalModel.find({
    status: PUBLISHED,
    slug: { $ne: excludeSlug },
    $or: orClauses,
  })
    .sort({ publishedAt: -1 })
    .limit(LIMITS.RELATED_MAX)
    .lean();
};
