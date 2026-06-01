import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NextResponse } from 'next/server';
import { SIGNALS } from '@/lib/content/dataset.js';
import { VERSE_TOPIC_SLUGS } from '@/lib/content/biblia.js';
import { listPosts } from '@/lib/content/blog.js';
import { isTtsConfigured } from '@/lib/media/elevenlabs.js';

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
    const posts = listPosts();

    return NextResponse.json({
      content: {
        signals: SIGNALS.length,
        verseTopics: VERSE_TOPIC_SLUGS.length,
        blogPosts: posts.length,
        totalPages: SIGNALS.length + VERSE_TOPIC_SLUGS.length + posts.length,
      },
      queue: {
        total: items.length,
        pending: items.filter((i) => i.status === 'pending').length,
        done: items.filter((i) => i.status === 'done').length,
        error: items.filter((i) => i.status === 'error').length,
      },
      services: {
        tts: isTtsConfigured(),
        openai: Boolean(process.env.OPENAI_API_KEY),
        pexels: Boolean(process.env.PEXELS_API_KEY),
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
