import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NextResponse } from 'next/server';

const QUEUE_PATH = resolve(process.cwd(), 'lib/content/content-queue.json');
const TOKEN = process.env.ADMIN_TOKEN || process.env.REVALIDATE_TOKEN || '';

function auth(req) {
  const h = req.headers.get('authorization') || '';
  const t = h.replace(/^Bearer\s+/i, '');
  return t && t === TOKEN;
}

export async function GET(req) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const queue = JSON.parse(readFileSync(QUEUE_PATH, 'utf-8'));
    const items = queue.items || [];
    const pending = items.filter((i) => i.status === 'pending').length;
    const done = items.filter((i) => i.status === 'done').length;
    const error = items.filter((i) => i.status === 'error').length;
    return NextResponse.json({ total: items.length, pending, done, error, items });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH: atualiza status de um item (ex: retry um error, pausar um pending)
export async function PATCH(req) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id, status } = await req.json();
    if (!id || !['pending', 'done', 'error', 'skip'].includes(status)) {
      return NextResponse.json({ error: 'id e status (pending|done|error|skip) obrigatórios' }, { status: 400 });
    }
    const queue = JSON.parse(readFileSync(QUEUE_PATH, 'utf-8'));
    const item = queue.items.find((i) => i.id === id);
    if (!item) return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    item.status = status;
    writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n', 'utf-8');
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
