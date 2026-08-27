'use client';
import { useState, useEffect } from 'react';

// ── Login ────────────────────────────────────────────────────────────

function Login({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erro'); setLoading(false); return; }
      onLogin(data);
    } catch {
      setError('Erro de conexão');
    }
    setLoading(false);
  };

  return (
    <div className="login-wrap">
      <form className="login-box" onSubmit={submit}>
        <h1>✦ Admin</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 20 }}>
          Um Sinal de Fé
        </p>
        <input
          placeholder="Usuário"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          autoComplete="username"
          required
        />
        <input
          placeholder="Senha"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          autoComplete="current-password"
          required
        />
        {error && <p style={{ color: 'var(--red)', fontSize: '0.82rem', marginBottom: 10 }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('admin-session');
    if (saved) {
      try { setSession(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const handleLogin = (data) => {
    const s = {
      user: data.user,
      apiUrl: data.apiUrl,
      apiToken: data.apiToken,
      coreApiUrl: data.coreApiUrl,
      coreApiToken: data.coreApiToken,
    };
    setSession(s);
    sessionStorage.setItem('admin-session', JSON.stringify(s));
  };

  const handleLogout = () => {
    setSession(null);
    sessionStorage.removeItem('admin-session');
  };

  if (!session) return <Login onLogin={handleLogin} />;
  return <Dashboard session={session} onLogout={handleLogout} />;
}

function ContentDashboard() {
  return (
    <p style={{ color: 'var(--muted)' }}>
      Conteúdo agora vive como arquivos estáticos em apps/umsinaldefe/content/signals/.
      Não tem mais fila nem geração automática aqui.
    </p>
  );
}

function Dashboard({ session, onLogout }) {
  return (
    <>
      <div className="header">
        <span className="dot" />
        <h1>✦ Fernando · Admin</h1>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
          Logado como <strong>{session.user}</strong>
        </span>
        <button className="btn-sm" onClick={onLogout}>Sair</button>
      </div>
      <div className="container">
        <ContentDashboard />
      </div>
    </>
  );
}
