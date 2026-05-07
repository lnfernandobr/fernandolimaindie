import type { ChannelDoc } from '../models/Channel.js';
import type { RunDoc } from '../models/Run.js';
import type { PostDoc } from '../models/Post.js';
import type { AuthorDoc } from '../models/Author.js';
import type { CategoryDoc } from '../models/Category.js';
import type {
  ArticleMetadata,
  ArticleOutline,
  GeneratedImage,
  ImageBrief,
  SelectedTopic,
  TopicCandidate,
  WrittenArticle,
} from '../ai/index.js';

export interface PipelineContext {
  channel: ChannelDoc & { _id: any };
  run: RunDoc & { _id: any };

  /** Alvo de tempo de leitura solicitado por quem disparou o pipeline. Opcional. */
  targetReadingMinutes?: number;

  // Saídas dos steps (preenchidas conforme avançam)
  candidates?: TopicCandidate[];
  topic?: SelectedTopic;
  outline?: ArticleOutline;
  article?: WrittenArticle;
  metadata?: ArticleMetadata;
  imageBrief?: ImageBrief;
  cover?: GeneratedImage;
  author?: AuthorDoc & { _id: any };
  category?: CategoryDoc & { _id: any };
  tagSlugs?: string[];
  post?: PostDoc & { _id: any };
}

export type PipelineStep = (ctx: PipelineContext) => Promise<void>;
