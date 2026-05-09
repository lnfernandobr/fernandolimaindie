import { Schema, model, type InferSchemaType, type Model, Types } from 'mongoose';

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    caption: { type: String },
    credit: { type: String },
  },
  { _id: false },
);

const faqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false },
);

const howToStepSchema = new Schema(
  {
    name: { type: String, required: true },
    text: { type: String, required: true },
    imageUrl: { type: String },
  },
  { _id: false },
);

const referenceSchema = new Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    publisher: { type: String },
    accessedAt: { type: Date },
  },
  { _id: false },
);

const postSchema = new Schema(
  {
    channelId: { type: Schema.Types.ObjectId, ref: 'Channel', required: true, index: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    format: {
      type: String,
      enum: ['article', 'how-to', 'list', 'review', 'opinion'],
      default: 'article',
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    tags: { type: [String], default: [], index: true },
    coverImage: { type: imageSchema, required: true },
    gallery: { type: [imageSchema], default: [] },
    metaTitle: { type: String, required: true },
    metaDescription: { type: String, required: true },
    keywords: { type: [String], default: [] },
    faq: { type: [faqSchema], default: [] },
    howToSteps: { type: [howToStepSchema], default: [] },
    references: { type: [referenceSchema], default: [] },
    language: { type: String, default: 'pt-BR' },
    wordCount: { type: Number, default: 0 },
    readingTimeMinutes: { type: Number, default: 0 },
    publishedAt: { type: Date, index: true },
    updatedAtContent: { type: Date },
    featured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

postSchema.index({ channelId: 1, slug: 1 }, { unique: true });
postSchema.index(
  { title: 'text', excerpt: 'text', content: 'text', tags: 'text' },
  {
    weights: { title: 10, excerpt: 5, tags: 3, content: 1 },
    name: 'PostTextIndex',
    default_language: 'portuguese',
    language_override: '_searchLang',
  },
);

export type PostDoc = InferSchemaType<typeof postSchema> & { _id: Types.ObjectId };
export const Post: Model<PostDoc> = model<PostDoc>('Post', postSchema);
