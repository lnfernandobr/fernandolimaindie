import { connectDb, disconnectDb } from '../config/db.js';
import { logger } from '../config/logger.js';
import { bootstrapAdmin } from './bootstrapAdmin.js';
import { seedSonoprofundo } from './sonoprofundoSeed.js';

async function main() {
  await connectDb();
  await bootstrapAdmin();
  await seedSonoprofundo();
  logger.info('seed complete');
  await disconnectDb();
}

main().catch((err) => {
  logger.error({ err }, 'seed failed');
  process.exit(1);
});
