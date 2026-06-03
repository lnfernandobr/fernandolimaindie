import { GenerationConfigModel } from './generation.config.model.js';

const KEY = 'generation';

/**
 * Config do cron lida em runtime. Faz upsert com o default (dailyLimit=2) na
 * primeira leitura, então o valor vive no banco e é editável pelo admin.
 */
export const getGenerationConfig = async () => {
  const doc = await GenerationConfigModel.findOneAndUpdate(
    { key: KEY },
    { $setOnInsert: { key: KEY } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();
  return { dailyLimit: doc.dailyLimit };
};

export const updateGenerationConfig = async (patch) => {
  const doc = await GenerationConfigModel.findOneAndUpdate(
    { key: KEY },
    { $set: patch },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();
  return { dailyLimit: doc.dailyLimit };
};
