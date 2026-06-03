/**
 * Dispara a geração manualmente (o mesmo job do cron): gera
 * CRON_GENERATION_DAILY_LIMIT seeds pendentes por prioridade, salva o run,
 * revalida o site (ISR) e pinga o IndexNow.
 *
 * Rodar de /opt/fernandolimaindie (Doppler injeta MONGODB_URI/OPENAI_API_KEY/etc):
 *   doppler run -p fernandolimaindie -c prd -- node apps/api/scripts/run-generation.mjs
 *
 * Pra encher mais rápido no começo, rode várias vezes ou suba o
 * CRON_GENERATION_DAILY_LIMIT no Doppler temporariamente.
 */
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { runGenerationJob } from '../src/modules/cron/generation.job.js';

await connectDatabase();
const run = await runGenerationJob('manual');
console.log(
  JSON.stringify(
    {
      created: run.created,
      regenerated: run.regenerated,
      skipped: run.skipped,
      failed: run.failed,
      totalProcessed: run.totalProcessed,
    },
    null,
    2,
  ),
);
// Sem process.exit: deixa as chamadas de revalidação/IndexNow (fire-and-forget) terminarem.
await disconnectDatabase();
