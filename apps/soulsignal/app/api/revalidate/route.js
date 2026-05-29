import { revalidateTag, revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { env } from '@/lib/env.js';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { token, tags = [], paths = [] } = body;

  if (!token || token !== env.REVALIDATE_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const revalidated = { tags: [], paths: [] };

  for (const tag of tags) {
    revalidateTag(tag, 'max');
    revalidated.tags.push(tag);
  }

  for (const path of paths) {
    revalidatePath(path);
    revalidated.paths.push(path);
  }

  return NextResponse.json({ revalidated, timestamp: new Date().toISOString() });
}
