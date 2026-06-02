import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NextResponse } from 'next/server';

const QUEUE_PATH = resolve(process.cwd(), 'lib/content/content-queue.json');
const TOKEN = process.env.ADMIN_TOKEN || process.env.REVALIDATE_TOKEN || '';
const TYPES = ['salmo', 'oracao', 'devocional', 'reflexao', 'biblia', 'blog'];
const KIND_BY_TYPE = { salmo: 'psalm', oracao: 'prayer', devocional: 'devotional', reflexao: 'reflection' };
const CATEGORY_BY_TYPE = { salmo: 'salmos', oracao: 'oracoes', devocional: 'devocionais', reflexao: 'oracoes', biblia: 'biblia-explicada', blog: 'vida-crista' };

function auth(req) {
  const t = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  return t && t === TOKEN;
}
const load = () => JSON.parse(readFileSync(QUEUE_PATH, 'utf-8'));
const save = (queue) => writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n', 'utf-8');
const slugify = (s) =>
  String(s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export async function GET(req) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const queue = load();
    const items = queue.items || [];
    const count = (s) => items.filter((i) => i.status === s).length;
    return NextResponse.json({
      total: items.length,
      pending: count('pending'),
      done: count('done'),
      error: count('error'),
      items,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH: ações rápidas (action) e/ou edição de campos de UM item.
// body: { id, action?, status?, priority?, scheduledFor?, audio?, title?, keyword?, brief? }
export async function PATCH(req) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const queue = load();
    const item = queue.items.find((i) => i.id === body.id);
    if (!item) return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });

    switch (body.action) {
      case 'runNow':     // vai pro topo e fica pendente: é o próximo a gerar
        item.status = 'pending'; item.scheduledFor = null; item.priority = 0; break;
      case 'skip':       item.status = 'skip'; break;
      case 'reactivate': item.status = 'pending'; break;
      case 'up':         item.priority = Math.max(0, (item.priority ?? 3) - 1); break;
      case 'down':       item.priority = (item.priority ?? 3) + 1; break;
      default: break;
    }

    if (['pending', 'done', 'error', 'skip'].includes(body.status)) item.status = body.status;
    if (Number.isFinite(Number(body.priority))) item.priority = Math.max(0, parseInt(body.priority, 10));
    if (body.scheduledFor !== undefined) item.scheduledFor = body.scheduledFor || null;
    if (['on', 'off', 'auto'].includes(body.audio)) item.audio = body.audio;
    if (typeof body.title === 'string' && body.title.trim()) item.title = body.title.trim();
    if (typeof body.keyword === 'string' && body.keyword.trim()) item.keyword = body.keyword.trim();
    if (typeof body.brief === 'string') item.brief = body.brief;

    save(queue);
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST: adiciona um item novo à fila.
// body: { type, keyword, title?, brief?, category?, slug?, tag?, volume?, sd?, priority?, audio? }
export async function POST(req) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const type = TYPES.includes(body.type) ? body.type : 'blog';
    const keyword = String(body.keyword || '').trim();
    if (!keyword) return NextResponse.json({ error: 'keyword obrigatória' }, { status: 400 });

    const queue = load();
    const nextId = queue.items.reduce((m, i) => Math.max(m, i.id || 0), 0) + 1;
    const base = slugify(body.slug || keyword);
    const num = (keyword.match(/\d+/) || [])[0];
    const slug =
      type === 'salmo' ? (base.startsWith('salmo-') ? base : `salmo-${num || base}`)
        : (type === 'oracao' || type === 'reflexao') ? (base.startsWith('oracao-') ? base : `oracao-${base}`)
          : type === 'devocional' ? (base.startsWith('devocional-') ? base : `devocional-${base}`)
            : type === 'biblia' ? base.replace(/^versiculos?-(sobre|de)-/, '')
              : base;

    const item = {
      id: nextId,
      type,
      ...(KIND_BY_TYPE[type] ? { kind: KIND_BY_TYPE[type], intent: 'faith', topicSlug: 'oracoes-essenciais' } : {}),
      ...(type === 'biblia' ? { intent: 'faith', tag: body.tag || keyword } : {}),
      category: body.category || CATEGORY_BY_TYPE[type],
      slug,
      keyword,
      volume: Number.isFinite(Number(body.volume)) ? parseInt(body.volume, 10) : null,
      sd: Number.isFinite(Number(body.sd)) ? parseInt(body.sd, 10) : null,
      priority: Number.isFinite(Number(body.priority)) ? parseInt(body.priority, 10) : 1,
      title: String(body.title || keyword).trim(),
      brief: String(body.brief || '').trim(),
      audio: ['on', 'off', 'auto'].includes(body.audio) ? body.audio : 'auto',
      status: 'pending',
      source: 'admin',
    };
    queue.items.push(item);
    save(queue);
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE: remove um item. body: { id }
export async function DELETE(req) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json().catch(() => ({}));
    const queue = load();
    const before = queue.items.length;
    queue.items = queue.items.filter((i) => i.id !== body.id);
    if (queue.items.length === before) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    }
    save(queue);
    return NextResponse.json({ ok: true, removed: body.id });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
