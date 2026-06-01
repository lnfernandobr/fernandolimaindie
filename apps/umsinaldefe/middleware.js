import { NextResponse } from 'next/server';

/**
 * Middleware que adiciona CORS nas rotas /api/admin/* pro dashboard admin
 * (que roda num domínio diferente na Vercel) conseguir chamar.
 */
export function middleware(request) {
  // Preflight (OPTIONS)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(request),
    });
  }

  const response = NextResponse.next();
  for (const [k, v] of Object.entries(corsHeaders(request))) {
    response.headers.set(k, v);
  }
  return response;
}

function corsHeaders(request) {
  const origin = request.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export const config = {
  matcher: '/api/admin/:path*',
};
