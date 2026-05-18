import { UserModel } from './users.model.js';

const normalize = (username) => username.toLowerCase();

export const findUserByUsername = (username) =>
  UserModel.findOne({ username: normalize(username) }).lean();

export const createUser = ({ name, username, passwordHash, role }) =>
  UserModel.create({ name, username: normalize(username), passwordHash, role });

export const usernameExists = async (username) =>
  (await UserModel.exists({ username: normalize(username) })) !== null;
