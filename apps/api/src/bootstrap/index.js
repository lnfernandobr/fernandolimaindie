import { bootstrapAdmin } from './bootstrap-admin.js';

const bootstrapTasks = Object.freeze([bootstrapAdmin]);

export const runBootstrapTasks = async () => {
  for (const task of bootstrapTasks) {
    await task();
  }
};
