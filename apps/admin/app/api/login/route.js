import { NextResponse } from 'next/server';

const USERS = {
  fernando: process.env.ADMIN_PASSWORD || 'sinal2026',
};

const API_TOKEN = process.env.ADMIN_TOKEN || 'usdf-admin-2026';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://umsinaldefe.com.br';

const CORE_API_URL = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:4444';
const CORE_USER = process.env.CORE_API_USERNAME || 'fernando';
const CORE_PASS = process.env.CORE_API_PASSWORD || 'Fz9mPx7Kq2vRtY8n';

const fetchCoreToken = async () => {
  try {
    const res = await fetch(`${CORE_API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: CORE_USER, password: CORE_PASS }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.token ?? null;
  } catch {
    return null;
  }
};

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Usuário e senha obrigatórios' }, { status: 400 });
    }
    const expected = USERS[username.toLowerCase()];
    if (!expected || password !== expected) {
      return NextResponse.json({ error: 'Usuário ou senha incorretos' }, { status: 401 });
    }
    const coreApiToken = await fetchCoreToken();
    return NextResponse.json({
      ok: true,
      user: username.toLowerCase(),
      apiUrl: API_URL,
      apiToken: API_TOKEN,
      coreApiUrl: CORE_API_URL,
      coreApiToken,
    });
  } catch {
    return NextResponse.json({ error: 'Erro no login' }, { status: 500 });
  }
}
