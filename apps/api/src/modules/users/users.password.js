import bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from '../../constants/auth.js';

export const hashPassword = (plain) => bcrypt.hash(plain, BCRYPT_ROUNDS);

export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);
