import { bootstrapAdmin } from './bootstrap-admin.js';
import { bootstrapInstagramCleanup } from './bootstrap-instagram-cleanup.js';
import { bootstrapSeeds } from './bootstrap-seeds.js';

const bootstrapTasks = Object.freeze([bootstrapAdmin, bootstrapInstagramCleanup, bootstrapSeeds]);

export const runBootstrapTasks = async () => {
  for (const task of bootstrapTasks) {
    await task();
  }
};
