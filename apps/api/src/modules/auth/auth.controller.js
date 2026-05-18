import { loginInputSchema } from './auth.schema.js';
import { authenticate } from './auth.service.js';

export const handleLogin = async (req, res) => {
  const credentials = loginInputSchema.parse(req.body);
  const result = await authenticate(credentials);
  res.json(result);
};

export const handleMe = (req, res) => {
  res.json({ user: req.user });
};
