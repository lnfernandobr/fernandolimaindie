import { SeedModel } from './generation.seed.model.js';

export const countSeeds = () => SeedModel.countDocuments();

export const bulkUpsertSeeds = (docs) =>
  SeedModel.bulkWrite(
    docs.map((d) => ({
      updateOne: { filter: { slug: d.slug }, update: { $setOnInsert: d }, upsert: true },
    })),
    { ordered: false },
  );

// Pro cron: só ativos, ordenados por prioridade (1 = mais alto).
export const listActiveSeeds = () =>
  SeedModel.find({ status: 'active' }).sort({ priority: 1, createdAt: 1 }).lean();

export const listActiveSeedsByKind = (seedKind) =>
  SeedModel.find({ status: 'active', seedKind }).sort({ priority: 1, createdAt: 1 }).lean();

// Pro admin: todos (inclui skipped).
export const listAllSeeds = () =>
  SeedModel.find().sort({ priority: 1, createdAt: 1 }).lean();

export const findSeedDocBySlug = (slug) => SeedModel.findOne({ slug }).lean();

export const createSeedDoc = (doc) => SeedModel.create(doc);

export const updateSeedBySlug = (slug, patch) =>
  SeedModel.findOneAndUpdate({ slug }, patch, { new: true }).lean();

export const appendRunLogEntry = (slug, entry) =>
  SeedModel.findOneAndUpdate(
    { slug },
    { $push: { runLog: entry } },
    { new: true },
  ).lean();

export const deleteSeedBySlug = (slug) => SeedModel.findOneAndDelete({ slug }).lean();
