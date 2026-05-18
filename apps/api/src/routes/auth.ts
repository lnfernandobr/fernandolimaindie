import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { loginInputSchema } from '@fernandolimaindie/shared';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { Unauthorized } from '../utils/errors.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import type { SignOptions } from 'jsonwebtoken';

export const authRouter: Router = Router();

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const parsed = loginInputSchema.parse(req.body);
    const user = await User.findOne({ username: parsed.username.toLowerCase() }).lean();
    if (!user) throw Unauthorized('Invalid credentials');
    const ok = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!ok) throw Unauthorized('Invalid credentials');
    const token = jwt.sign(
      { sub: String(user._id), username: user.username, name: user.name },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as SignOptions,
    );
    res.json({
      token,
      user: { id: String(user._id), name: user.name, username: user.username },
    });
  }),
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  }),
);
