/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEFAULT_POSTS_PLAN, type PostPlanItem } from '@bn/shared';
import type { ChannelDoc } from '../models/Channel.js';
import type { CategoryDoc } from '../models/Category.js';
import type { TagDoc } from '../models/Tag.js';
import type { PostDoc } from '../models/Post.js';
import type { RunDoc } from '../models/Run.js';

const toIso = (d: Date | string | undefined | null): string | undefined =>
  d ? (d instanceof Date ? d.toISOString() : new Date(d).toISOString()) : undefined;

const idOf = (v: any): string => (typeof v === 'string' ? v : v?.toString?.() ?? '');

function resolvePostsPlan(c: any): PostPlanItem[] {
  const plan = (c.postsPlan ?? []).filter(
    (b: any) => b && Number.isFinite(b.count) && Number.isFinite(b.targetReadingMinutes),
  );
  if (plan.length > 0) {
    return plan.map((b: any) => ({
      count: Math.max(1, Math.min(20, Math.trunc(b.count))),
      targetReadingMinutes: Math.max(2, Math.min(30, Math.trunc(b.targetReadingMinutes))),
    }));
  }
  // Migra legado: postsPerSlot vira um único bucket de 8min.
  if (Number.isFinite(c.postsPerSlot) && c.postsPerSlot > 0) {
    return [{ count: Math.max(1, Math.min(20, Math.trunc(c.postsPerSlot))), targetReadingMinutes: 8 }];
  }
  return DEFAULT_POSTS_PLAN;
}

export function channelToDto(c: ChannelDoc & { _id: any; createdAt?: Date; updatedAt?: Date }) {
  return {
    id: idOf(c._id),
    slug: c.slug,
    name: c.name,
    niche: c.niche,
    siteUrl: c.siteUrl,
    language: c.language,
    timezone: c.timezone,
    active: c.active,
    publishFrequency: (c.publishFrequency ?? 'daily') as 'daily' | 'weekly' | 'custom',
    publishTimes: c.publishTimes ?? [],
    postsPlan: resolvePostsPlan(c),
    publishWeekdays: c.publishWeekdays ?? [0, 1, 2, 3, 4, 5, 6],
    notes: c.notes ?? undefined,
    lastAudit: c.lastAudit ? auditToDto(c.lastAudit as any) : undefined,
    createdAt: toIso(c.createdAt) ?? new Date().toISOString(),
    updatedAt: toIso(c.updatedAt) ?? new Date().toISOString(),
  };
}

export function auditToDto(a: any) {
  return {
    fetchedAt: toIso(a.fetchedAt) ?? new Date().toISOString(),
    reachable: !!a.reachable,
    pagespeed: a.pagespeed
      ? {
          fetchedAt: toIso(a.pagespeed.fetchedAt) ?? new Date().toISOString(),
          mobile: a.pagespeed.mobile ? cloneStrategy(a.pagespeed.mobile) : null,
          desktop: a.pagespeed.desktop ? cloneStrategy(a.pagespeed.desktop) : null,
          error: a.pagespeed.error,
        }
      : null,
    geo: { ...a.geo },
    visits: { ...a.visits },
    recommendations: a.recommendations ?? [],
    aiInsights: a.aiInsights
      ? {
          generatedAt: toIso(a.aiInsights.generatedAt) ?? new Date().toISOString(),
          provider: a.aiInsights.provider,
          insights: a.aiInsights.insights ?? [],
        }
      : undefined,
  };
}

function cloneStrategy(s: any) {
  return {
    scores: { ...s.scores },
    metrics: { ...s.metrics },
    topIssues: (s.topIssues ?? []).map((t: any) => ({
      id: t.id,
      title: t.title,
      displayValue: t.displayValue,
      score: t.score,
      category: t.category,
    })),
  };
}

export function categoryToDto(c: CategoryDoc & { _id: any; createdAt?: Date; updatedAt?: Date }) {
  return {
    id: idOf(c._id),
    channelId: idOf(c.channelId),
    slug: c.slug,
    name: c.name,
    description: c.description ?? undefined,
    color: c.color,
    iconKey: c.iconKey ?? undefined,
    order: c.order ?? 0,
    createdAt: toIso(c.createdAt) ?? new Date().toISOString(),
    updatedAt: toIso(c.updatedAt) ?? new Date().toISOString(),
  };
}

export function tagToDto(t: TagDoc & { _id: any; createdAt?: Date; updatedAt?: Date }) {
  return {
    id: idOf(t._id),
    channelId: idOf(t.channelId),
    slug: t.slug,
    name: t.name,
    createdAt: toIso(t.createdAt) ?? new Date().toISOString(),
    updatedAt: toIso(t.updatedAt) ?? new Date().toISOString(),
  };
}

export function postToDto(
  p: PostDoc & {
    _id: any;
    createdAt?: Date;
    updatedAt?: Date;
    categoryId: any;
  },
  populated?: { category?: CategoryDoc | null },
) {
  return {
    id: idOf(p._id),
    channelId: idOf(p.channelId),
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    format: p.format,
    status: p.status,
    categoryId: idOf(p.categoryId),
    tags: p.tags ?? [],
    coverImage: p.coverImage,
    gallery: p.gallery ?? [],
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    keywords: p.keywords ?? [],
    faq: p.faq ?? [],
    howToSteps: p.howToSteps ?? [],
    references: (p.references ?? []).map((r: any) => ({
      title: r.title,
      url: r.url,
      publisher: r.publisher ?? undefined,
      accessedAt: toIso(r.accessedAt),
    })),
    language: p.language,
    wordCount: p.wordCount ?? 0,
    readingTimeMinutes: p.readingTimeMinutes ?? 0,
    publishedAt: toIso(p.publishedAt),
    updatedAtContent: toIso(p.updatedAtContent),
    featured: p.featured ?? false,
    createdAt: toIso(p.createdAt) ?? new Date().toISOString(),
    updatedAt: toIso(p.updatedAt) ?? new Date().toISOString(),
    category: populated?.category ? categoryToDto(populated.category as any) : undefined,
  };
}

export function runToDto(r: RunDoc & { _id: any }) {
  return {
    id: idOf(r._id),
    channelId: idOf(r.channelId),
    trigger: r.trigger,
    cronExpression: r.cronExpression ?? undefined,
    status: r.status,
    startedAt: toIso(r.startedAt) ?? new Date().toISOString(),
    finishedAt: toIso(r.finishedAt),
    durationMs: r.durationMs ?? undefined,
    steps: (r.steps ?? []).map((s: any) => ({
      name: s.name,
      status: s.status,
      startedAt: toIso(s.startedAt),
      finishedAt: toIso(s.finishedAt),
      durationMs: s.durationMs,
      message: s.message,
      data: s.data,
    })),
    postId: r.postId ? idOf(r.postId) : undefined,
    error: r.error ?? undefined,
  };
}
