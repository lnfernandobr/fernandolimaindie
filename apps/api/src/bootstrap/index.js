import { bootstrapAdmin } from './bootstrap-admin.js';
import { bootstrapInstagramCleanup } from './bootstrap-instagram-cleanup.js';

const bootstrapTasks = Object.freeze([bootstrapAdmin, bootstrapInstagramCleanup]);

export const runBootstrapTasks = async () => {
  for (const task of bootstrapTasks) {
    await task();
  }
};
