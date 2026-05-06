import { NextResponse, type NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { REVALIDATE_SECRET } from '@/lib/config';

interface Body {
  tags?: string[];
  channelSlug?: string;
  postSlug?: string;
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!secret || secret !== REVALIDATE_SECRET) {
    return NextResponse.json({ revalidated: false, message: 'Invalid secret' }, { status: 401 });
  }
  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    body = {};
  }
  const tags = new Set<string>(body.tags ?? []);
  if (body.channelSlug) tags.add(`channel:${body.channelSlug}`);
  if (body.postSlug && body.channelSlug) tags.add(`post:${body.channelSlug}:${body.postSlug}`);
  if (tags.size === 0) tags.add('posts');
  for (const tag of tags) revalidateTag(tag, 'default');
  return NextResponse.json({ revalidated: true, tags: [...tags] });
}
