import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export const issueAccessToken = (claims) =>
  jwt.sign(claims, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
