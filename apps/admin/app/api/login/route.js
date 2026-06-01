import { NextResponse } from 'next/server';

// Usuários do admin. Em prod, mover pra env ou banco.
const USERS = {
  fernando: process.env.ADMIN_PASSWORD || 'sinal2026',
};

// Token que o admin usa pra chamar as APIs do umsinaldefe.
const API_TOKEN = process.env.ADMIN_TOKEN || 'usdf-admin-2026';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://umsinaldefe.com.br';

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
    // Login OK: devolve o token da API e a URL pro front chamar
    return NextResponse.json({
      ok: true,
      user: username.toLowerCase(),
      apiUrl: API_URL,
      apiToken: API_TOKEN,
    });
  } catch {
    return NextResponse.json({ error: 'Erro no login' }, { status: 500 });
  }
}
