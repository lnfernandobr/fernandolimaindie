import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NextResponse } from 'next/server';

const POSTS_PATH = resolve(process.cwd(), 'lib/content/generated-posts.json');
const TOKEN = process.env.ADMIN_TOKEN || process.env.REVALIDATE_TOKEN || '';

function auth(req) {
  const h = req.headers.get('authorization') || '';
  const t = h.replace(/^Bearer\s+/i, '');
  return t && t === TOKEN;
}

export async function GET(req) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const file = JSON.parse(readFileSync(POSTS_PATH, 'utf-8'));
    const posts = file.posts || [];
    return NextResponse.json({
      total: posts.length,
      posts: posts.map((p) => ({
        slug: p.slug,
        title: p.title,
        category: p.category,
        keyword: p.keyword,
        readMins: p.readMins,
        hasImage: Boolean(p.image?.src),
        publishedAt: p.publishedAt,
      })),
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
