import { AUTH_ERRORS } from '../../constants/auth.js';
import { unauthorized } from '../../errors/factories.js';
import { findUserByUsername, toPublicUser, verifyPassword } from '../users/index.js';
import { issueAccessToken } from './auth.tokens.js';

const buildTokenClaims = (user) => ({
  sub: String(user._id),
  username: user.username,
  name: user.name,
});

export const authenticate = async ({ username, password }) => {
  const user = await findUserByUsername(username);
  if (!user) throw unauthorized(AUTH_ERRORS.INVALID_CREDENTIALS);

  const passwordMatches = await verifyPassword(password, user.passwordHash);
  if (!passwordMatches) throw unauthorized(AUTH_ERRORS.INVALID_CREDENTIALS);

  return {
    token: issueAccessToken(buildTokenClaims(user)),
    user: toPublicUser(user),
  };
};
