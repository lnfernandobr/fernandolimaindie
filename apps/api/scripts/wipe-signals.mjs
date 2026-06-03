/**
 * Apaga TODOS os documentos Signal (limpa o conteúdo publicado do site).
 * O cron repopula a partir dos seeds, 5/dia por prioridade.
 *
 * SEGURANÇA: por padrão só mostra a contagem (dry-run). Para apagar de verdade,
 * passe --yes. Sempre rode um mongodump antes em produção.
 *
 *   node apps/api/scripts/wipe-signals.mjs            # dry-run (só conta)
 *   node apps/api/scripts/wipe-signals.mjs --yes      # apaga
 */
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { env } from '../src/config/env.js';
import { SignalModel } from '../src/modules/signals/signals.model.js';

const confirmed = process.argv.includes('--yes');
const redacted = env.MONGODB_URI.replace(/\/\/.*?@/, '//***@');

await connectDatabase();
const total = await SignalModel.countDocuments();
console.log(`Alvo: ${redacted}`);
console.log(`Signals atuais: ${total}`);

if (!confirmed) {
  console.log('\nDry-run. Nada apagado. Rode com --yes para apagar (faça backup antes).');
  await disconnectDatabase();
  process.exit(0);
}

const res = await SignalModel.deleteMany({});
console.log(`\nApagados: ${res.deletedCount} signals. Restantes: ${await SignalModel.countDocuments()}`);
await disconnectDatabase();
console.log('OK');
