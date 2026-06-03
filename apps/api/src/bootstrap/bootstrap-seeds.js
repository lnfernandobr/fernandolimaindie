import { logger } from '../config/logger.js';
import { countSeeds, syncSeedsFromFiles } from '../modules/generation/generation.seeds.js';

// Importa os seeds dos arquivos JSON pro banco no boot (upsert por slug).
// Idempotente: adiciona novos, preserva prioridade/status editados no admin.
export const bootstrapSeeds = async () => {
  try {
    const before = await countSeeds();
    const fromFiles = await syncSeedsFromFiles();
    const after = await countSeeds();
    logger.info({ before, after, fromFiles }, 'seeds synced from files');
  } catch (err) {
    logger.error({ err }, 'seed sync failed');
  }
};
