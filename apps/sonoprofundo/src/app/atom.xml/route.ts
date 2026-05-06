import { buildFeed } from '../feed.xml/route';

export const revalidate = 600;

export async function GET() {
  return new Response(await buildFeed('atom'), {
    headers: { 'content-type': 'application/atom+xml; charset=utf-8' },
  });
}
