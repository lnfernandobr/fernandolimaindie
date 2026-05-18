import { Schema, model } from 'mongoose';
import { ROLES } from '../../constants/auth.js';

const USER_COLLECTION = 'User';

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.ADMIN },
  },
  { timestamps: true },
);

export const UserModel = model(USER_COLLECTION, userSchema);
