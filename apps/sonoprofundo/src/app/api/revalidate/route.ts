import { NextResponse, type NextRequest } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { REVALIDATE_SECRET } from '@/lib/config';

interface Body {
  tags?: string[];
  channelSlug?: string;
  postSlug?: string;
}

const STATIC_ROUTES = ['/sitemap.xml', '/feed.xml', '/atom.xml', '/llms.txt'];

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
  for (const route of STATIC_ROUTES) revalidatePath(route);
  if (body.postSlug) revalidatePath(`/blog/${body.postSlug}`, 'page');
  return NextResponse.json({ revalidated: true, tags: [...tags], paths: STATIC_ROUTES });
}
