import { NextResponse } from 'next/server';
import { env } from '@/lib/env.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!env.INDEXNOW_KEY) {
    return new NextResponse('', { status: 404 });
  }
  return new NextResponse(env.INDEXNOW_KEY, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
