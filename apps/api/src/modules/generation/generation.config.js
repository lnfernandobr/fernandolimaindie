import { GenerationConfigModel } from './generation.config.model.js';
import { DEFAULT_DAILY_QUOTAS, QUOTA_KIND_ORDER } from '../../constants/generation.js';

const KEY = 'generation';

/**
 * Garante as chaves de todos os tipos sempre presentes no retorno: tipos
 * ausentes (doc legado, novo tipo) caem no default. Mantém a API/UI estável.
 */
const withDefaults = (quotas) => {
  const q = quotas ?? {};
  const out = {};
  for (const kind of QUOTA_KIND_ORDER) {
    out[kind] = typeof q[kind] === 'number' ? q[kind] : DEFAULT_DAILY_QUOTAS[kind];
  }
  return out;
};

/**
 * Config do cron lida em runtime. Faz upsert com os defaults na primeira leitura,
 * então a cota por tipo vive no banco e é editável pelo admin. Docs antigos (com o
 * antigo dailyLimit, sem dailyQuotas) caem nos defaults via withDefaults.
 */
export const getGenerationConfig = async () => {
  const doc = await GenerationConfigModel.findOneAndUpdate(
    { key: KEY },
    { $setOnInsert: { key: KEY } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();
  return { dailyQuotas: withDefaults(doc.dailyQuotas) };
};

/**
 * Merge parcial: só atualiza os tipos enviados (via paths dailyQuotas.<seedKind>),
 * preservando os demais. Retorna sempre as cotas completas.
 */
export const updateGenerationConfig = async (patch) => {
  const set = {};
  for (const [kind, value] of Object.entries(patch.dailyQuotas ?? {})) {
    set[`dailyQuotas.${kind}`] = value;
  }
  const doc = await GenerationConfigModel.findOneAndUpdate(
    { key: KEY },
    { $set: set, $setOnInsert: { key: KEY } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();
  return { dailyQuotas: withDefaults(doc.dailyQuotas) };
};
