/**
 * CLI: apaga um canal e tudo que pertence a ele.
 *
 *   pnpm --filter @fernandolimaindie/api remove-channel -- <slug>
 *
 * Apaga (em ordem segura):
 *   - Posts do canal
 *   - Categories do canal
 *   - Tags do canal
 *   - Runs do canal
 *   - O Channel em si
 *
 * Idempotente: rodar duas vezes não causa erro.
 */

import { connectDb, disconnectDb } from '../config/db.js';
import { logger } from '../config/logger.js';
import { Channel } from '../models/Channel.js';
import { Post } from '../models/Post.js';
import { Category } from '../models/Category.js';
import { Tag } from '../models/Tag.js';
import { Run } from '../models/Run.js';

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Uso: pnpm --filter @fernandolimaindie/api remove-channel -- <slug>');
    process.exit(2);
  }

  await connectDb();

  const channel = await Channel.findOne({ slug });
  if (!channel) {
    logger.warn({ slug }, 'channel not found — nothing to remove');
    await disconnectDb();
    process.exit(0);
  }

  const channelId = channel._id;
  const counts = {
    posts: 0,
    categories: 0,
    tags: 0,
    runs: 0,
  };

  counts.posts = (await Post.deleteMany({ channelId })).deletedCount ?? 0;
  counts.categories = (await Category.deleteMany({ channelId })).deletedCount ?? 0;
  counts.tags = (await Tag.deleteMany({ channelId })).deletedCount ?? 0;
  counts.runs = (await Run.deleteMany({ channelId })).deletedCount ?? 0;
  await Channel.deleteOne({ _id: channelId });

  logger.info({ slug, ...counts }, 'channel removed');
  await disconnectDb();
}

main().catch((err) => {
  logger.error({ err }, 'remove-channel failed');
  process.exit(1);
});
