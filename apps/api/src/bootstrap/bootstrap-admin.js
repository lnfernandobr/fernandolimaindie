import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ROLES } from '../constants/auth.js';
import { createUser, hashPassword, usernameExists } from '../modules/users/index.js';

export const bootstrapAdmin = async () => {
  const username = env.ADMIN_BOOTSTRAP_USERNAME;
  if (await usernameExists(username)) return;

  await createUser({
    name: env.ADMIN_BOOTSTRAP_NAME,
    username,
    passwordHash: await hashPassword(env.ADMIN_BOOTSTRAP_PASSWORD),
    role: ROLES.ADMIN,
  });

  logger.info({ username }, 'bootstrap admin user created');
};
