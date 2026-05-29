import { HTTP_STATUS } from '../../constants/http.js';
import {
  createEntitySchema,
  entitySlugParamSchema,
  listEntitiesQuerySchema,
  updateEntitySchema,
} from './entities.schema.js';
import {
  createEntity,
  getEntityBySlug,
  listEntities,
  updateEntity,
} from './entities.service.js';

export const handleListEntities = async (req, res) => {
  const query = listEntitiesQuerySchema.parse(req.query);
  const result = await listEntities(query);
  res.status(HTTP_STATUS.OK).json(result);
};

export const handleGetEntity = async (req, res) => {
  const { slug } = entitySlugParamSchema.parse(req.params);
  const entity = await getEntityBySlug(slug);
  res.status(HTTP_STATUS.OK).json(entity);
};

export const handleCreateEntity = async (req, res) => {
  const input = createEntitySchema.parse(req.body);
  const entity = await createEntity(input);
  res.status(HTTP_STATUS.CREATED).json(entity);
};

export const handleUpdateEntity = async (req, res) => {
  const { slug } = entitySlugParamSchema.parse(req.params);
  const patch = updateEntitySchema.parse(req.body);
  const entity = await updateEntity(slug, patch);
  res.status(HTTP_STATUS.OK).json(entity);
};
