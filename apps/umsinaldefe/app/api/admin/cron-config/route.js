import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { NextResponse } from 'next/server';

const CONFIG_PATH = resolve(process.cwd(), 'lib/content/cron-config.json');
const TOKEN = process.env.ADMIN_TOKEN || process.env.REVALIDATE_TOKEN || '';
const SECTIONS = ['salmo', 'oracao', 'biblia', 'blog', 'devocional', 'reflexao'];
const DEFAULT = {
  enabled: true,
  imageProvider: 'openai',
  scheduleHourUtc: 6,
  audio: { enabled: true, maxMinutes: 2 },
  perSection: { salmo: 2, oracao: 2, biblia: 2, blog: 2, devocional: 2, reflexao: 2 },
};

function auth(req) {
  const t = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  return t && t === TOKEN;
}

function load() {
  try {
    if (existsSync(CONFIG_PATH)) {
      const cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
      return {
        ...DEFAULT,
        ...cfg,
        audio: { ...DEFAULT.audio, ...(cfg.audio || {}) },
        perSection: { ...DEFAULT.perSection, ...(cfg.perSection || {}) },
      };
    }
  } catch {
    // cai no default
  }
  return DEFAULT;
}

export async function GET(req) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(load());
}

// PATCH: atualiza enabled e/ou perSection (quantos itens por seção o cron gera por execução)
export async function PATCH(req) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const cur = load();
    const next = { ...cur, perSection: { ...cur.perSection } };

    if (typeof body.enabled === 'boolean') next.enabled = body.enabled;
    if (typeof body.imageProvider === 'string' && ['openai', 'pexels', 'none'].includes(body.imageProvider)) {
      next.imageProvider = body.imageProvider;
    }
    if (body.scheduleHourUtc != null && Number.isFinite(Number(body.scheduleHourUtc))) {
      next.scheduleHourUtc = Math.min(23, Math.max(0, parseInt(body.scheduleHourUtc, 10) || 0));
    }
    if (body.audio && typeof body.audio === 'object') {
      next.audio = { ...next.audio };
      if (typeof body.audio.enabled === 'boolean') next.audio.enabled = body.audio.enabled;
      if (body.audio.maxMinutes != null) {
        next.audio.maxMinutes = Math.min(10, Math.max(1, parseInt(body.audio.maxMinutes, 10) || 1));
      }
    }

    if (body.perSection && typeof body.perSection === 'object') {
      for (const s of SECTIONS) {
        if (body.perSection[s] != null) {
          next.perSection[s] = Math.min(20, Math.max(0, parseInt(body.perSection[s], 10) || 0));
        }
      }
    }

    writeFileSync(CONFIG_PATH, JSON.stringify(next, null, 2) + '\n', 'utf-8');
    return NextResponse.json({ ok: true, config: next });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
