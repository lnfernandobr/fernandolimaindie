import { Router } from 'express';
import { channelInputSchema, paginationQuerySchema } from '@fernandolimaindie/shared';
import { Channel } from '../models/Channel.js';
import { BadRequest, Conflict, NotFound } from '../utils/errors.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { auditToDto, channelToDto } from '../utils/dto.js';
import { rescheduleChannel, unscheduleChannel } from '../scheduler/index.js';
import { runAudit } from '../audit/runner.js';

const AUDIT_FRESHNESS_MS = 60 * 60 * 1000; // 1h — PSI é caro (10–30s) e cota é por dia

export const channelsRouter: Router = Router();

channelsRouter.use(requireAuth);

channelsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, q } = paginationQuerySchema.parse(req.query);
    const filter = q ? { $or: [{ name: new RegExp(q, 'i') }, { slug: new RegExp(q, 'i') }] } : {};
    const [items, total] = await Promise.all([
      Channel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Channel.countDocuments(filter),
    ]);
    res.json({
      items: items.map((c) => channelToDto(c as any)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  }),
);

channelsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = channelInputSchema.parse(req.body);
    const exists = await Channel.findOne({ slug: data.slug }).lean();
    if (exists) throw Conflict(`Channel with slug "${data.slug}" already exists`);
    const created = await Channel.create(data);
    rescheduleChannel(created);
    res.status(201).json(channelToDto(created as any));
  }),
);

channelsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const channel = await Channel.findById(req.params.id).lean();
    if (!channel) throw NotFound('Channel not found');
    res.json(channelToDto(channel as any));
  }),
);

channelsRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = channelInputSchema.parse(req.body);
    const channel = await Channel.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!channel) throw NotFound('Channel not found');
    rescheduleChannel(channel);
    res.json(channelToDto(channel as any));
  }),
);

channelsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const channel = await Channel.findByIdAndDelete(req.params.id);
    if (!channel) throw NotFound('Channel not found');
    unscheduleChannel(String(channel._id));
    res.status(204).end();
  }),
);

/**
 * Audit do site externo do canal.
 * - GET retorna o último audit em cache (<10min); se velho ou ausente, roda agora.
 * - POST força execução de um novo audit.
 * - ?refresh=true em GET também força.
 */
channelsRouter.get(
  '/:id/audit',
  asyncHandler(async (req, res) => {
    const channel = await Channel.findById(String(req.params.id));
    if (!channel) throw NotFound('Channel not found');
    if (!channel.siteUrl) throw BadRequest('Channel has no siteUrl configured');

    const refresh = req.query.refresh === 'true';
    const withAI = req.query.ai === 'true';
    const last = channel.lastAudit as any;
    const fresh = last?.fetchedAt && Date.now() - new Date(last.fetchedAt).getTime() < AUDIT_FRESHNESS_MS;
    const hasAI = !!last?.aiInsights;

    // Reaproveita cache só se não for refresh, e se não pediram IA quando ainda não há.
    if (fresh && !refresh && (!withAI || hasAI)) {
      res.json(auditToDto(last));
      return;
    }

    const metrics = await runAudit(channel.siteUrl, {
      withAI,
      channelName: channel.name,
      niche: channel.niche,
    });
    const persisted: any = {
      ...metrics,
      fetchedAt: new Date(metrics.fetchedAt),
    };
    if (metrics.aiInsights) {
      persisted.aiInsights = {
        ...metrics.aiInsights,
        generatedAt: new Date(metrics.aiInsights.generatedAt),
      };
    } else if (last?.aiInsights && !withAI) {
      // Preserva insights anteriores quando o refresh é só técnico.
      persisted.aiInsights = last.aiInsights;
    }
    channel.lastAudit = persisted;
    await channel.save();
    res.json(auditToDto(channel.lastAudit as any));
  }),
);

channelsRouter.post(
  '/:id/audit',
  asyncHandler(async (req, res) => {
    const channel = await Channel.findById(String(req.params.id));
    if (!channel) throw NotFound('Channel not found');
    if (!channel.siteUrl) throw BadRequest('Channel has no siteUrl configured');

    const withAI = req.query.ai === 'true';
    const metrics = await runAudit(channel.siteUrl, {
      withAI,
      channelName: channel.name,
      niche: channel.niche,
    });
    const persisted: any = {
      ...metrics,
      fetchedAt: new Date(metrics.fetchedAt),
    };
    if (metrics.aiInsights) {
      persisted.aiInsights = {
        ...metrics.aiInsights,
        generatedAt: new Date(metrics.aiInsights.generatedAt),
      };
    }
    channel.lastAudit = persisted;
    await channel.save();
    res.json(auditToDto(channel.lastAudit as any));
  }),
);
