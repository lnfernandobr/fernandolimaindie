import express from 'express';
import { REQUEST_BODY_LIMIT } from '../constants/http.js';

export const jsonBodyParser = () => express.json({ limit: REQUEST_BODY_LIMIT });
