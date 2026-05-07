import { Schema, model, type InferSchemaType, type Model, Types } from 'mongoose';

const lighthouseStrategy = new Schema(
  {
    scores: {
      performance: { type: Number, default: null },
      accessibility: { type: Number, default: null },
      bestPractices: { type: Number, default: null },
      seo: { type: Number, default: null },
    },
    metrics: {
      lcp: { type: Number, default: null },
      cls: { type: Number, default: null },
      inp: { type: Number, default: null },
      fcp: { type: Number, default: null },
      ttfb: { type: Number, default: null },
      tbt: { type: Number, default: null },
      si: { type: Number, default: null },
    },
    topIssues: {
      type: [
        {
          id: String,
          title: String,
          displayValue: String,
          score: { type: Number, default: null },
          category: String,
        },
      ],
      default: [],
    },
  },
  { _id: false },
);

const auditSchema = new Schema(
  {
    fetchedAt: { type: Date, required: true },
    reachable: { type: Boolean, required: true },
    pagespeed: {
      type: new Schema(
        {
          fetchedAt: Date,
          mobile: { type: lighthouseStrategy, default: undefined },
          desktop: { type: lighthouseStrategy, default: undefined },
          error: String,
        },
        { _id: false },
      ),
      default: undefined,
    },
    geo: {
      hasJsonLd: Boolean,
      jsonLdCount: Number,
      hasLlmsTxt: Boolean,
      hasRssFeed: Boolean,
      botsAllowed: Boolean,
      score: Number,
    },
    visits: {
      tracked: Boolean,
      message: String,
    },
    recommendations: {
      type: [
        {
          severity: { type: String, enum: ['high', 'medium', 'low'] },
          area: {
            type: String,
            enum: ['performance', 'accessibility', 'best-practices', 'seo', 'geo'],
          },
          message: String,
        },
      ],
      default: [],
    },
    aiInsights: {
      generatedAt: Date,
      provider: String,
      insights: {
        type: [
          {
            severity: { type: String, enum: ['high', 'medium', 'low'] },
            area: {
              type: String,
              enum: ['content', 'structure', 'authority', 'opportunity'],
            },
            title: String,
            detail: String,
          },
        ],
        default: undefined,
      },
    },
  },
  { _id: false },
);

const channelSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    niche: { type: String, required: true },
    siteUrl: { type: String, required: true },
    language: { type: String, default: 'pt-BR' },
    timezone: { type: String, default: 'America/Sao_Paulo' },
    active: { type: Boolean, default: true, index: true },

    publishFrequency: { type: String, enum: ['daily', 'weekly', 'custom'], default: 'daily' },
    publishTimes: { type: [String], default: ['09:00'] },
    // Plano granular de geração: cada bucket = "N posts de até X min de leitura".
    postsPlan: {
      type: [
        new Schema(
          {
            count: { type: Number, required: true, min: 1, max: 20 },
            targetReadingMinutes: { type: Number, required: true, min: 2, max: 30 },
          },
          { _id: false },
        ),
      ],
      default: [{ count: 1, targetReadingMinutes: 8 }],
    },
    // Legacy — preservado pra ler dados antigos. Migrado pra postsPlan no DTO.
    postsPerSlot: { type: Number, min: 1, max: 10 },
    publishWeekdays: { type: [Number], default: [0, 1, 2, 3, 4, 5, 6] },

    defaultAuthorName: { type: String, default: 'Fernando' },
    notes: { type: String },

    lastAudit: { type: auditSchema, default: undefined },
  },
  { timestamps: true },
);

export type ChannelDoc = InferSchemaType<typeof channelSchema> & { _id: Types.ObjectId };
export const Channel: Model<ChannelDoc> = model<ChannelDoc>('Channel', channelSchema);
