import { HTTP_STATUS } from '../../constants/http.js';
import {
  createTopicSchema,
  listTopicsQuerySchema,
  topicSlugParamSchema,
  updateTopicSchema,
} from './topics.schema.js';
import {
  createTopic,
  getTopicBySlug,
  listTopics,
  updateTopic,
} from './topics.service.js';

export const handleListTopics = async (req, res) => {
  const query = listTopicsQuerySchema.parse(req.query);
  const result = await listTopics(query);
  res.status(HTTP_STATUS.OK).json(result);
};

export const handleGetTopic = async (req, res) => {
  const { slug } = topicSlugParamSchema.parse(req.params);
  const topic = await getTopicBySlug(slug);
  res.status(HTTP_STATUS.OK).json(topic);
};

export const handleCreateTopic = async (req, res) => {
  const input = createTopicSchema.parse(req.body);
  const topic = await createTopic(input);
  res.status(HTTP_STATUS.CREATED).json(topic);
};

export const handleUpdateTopic = async (req, res) => {
  const { slug } = topicSlugParamSchema.parse(req.params);
  const patch = updateTopicSchema.parse(req.body);
  const topic = await updateTopic(slug, patch);
  res.status(HTTP_STATUS.OK).json(topic);
};
