import { HTTP_STATUS } from '../../constants/http.js';
import {
  createSignalSchema,
  listSignalsQuerySchema,
  signalSlugParamSchema,
  updateSignalSchema,
} from './signals.schema.js';
import {
  createSignal,
  getRelatedForSignal,
  getSignalBySlug,
  listPublishedSignals,
  updateSignal,
} from './signals.service.js';

export const handleListSignals = async (req, res) => {
  const query = listSignalsQuerySchema.parse(req.query);
  const result = await listPublishedSignals(query);
  res.status(HTTP_STATUS.OK).json(result);
};

export const handleGetSignal = async (req, res) => {
  const { slug } = signalSlugParamSchema.parse(req.params);
  const signal = await getSignalBySlug(slug);
  res.status(HTTP_STATUS.OK).json(signal);
};

export const handleCreateSignal = async (req, res) => {
  const input = createSignalSchema.parse(req.body);
  const signal = await createSignal(input);
  res.status(HTTP_STATUS.CREATED).json(signal);
};

export const handleUpdateSignal = async (req, res) => {
  const { slug } = signalSlugParamSchema.parse(req.params);
  const patch = updateSignalSchema.parse(req.body);
  const signal = await updateSignal(slug, patch);
  res.status(HTTP_STATUS.OK).json(signal);
};

export const handleGetRelatedSignals = async (req, res) => {
  const { slug } = signalSlugParamSchema.parse(req.params);
  const items = await getRelatedForSignal(slug);
  res.status(HTTP_STATUS.OK).json({ items });
};
