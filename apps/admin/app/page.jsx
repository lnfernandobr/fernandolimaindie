'use client';
import { useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://umsinaldefe.com.br';

function useApi(path, token) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setData(await res.json());
      else setData(null);
    } catch { setData(null); }
    setLoading(false);
  }, [path, token]);
  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, refresh };
}

function Login({ onLogin }) {
  const [url, setUrl] = useState('');
  const [tok, setTok] = useState('');
  return (
    <div className="login-wrap">
      <div className="login-box">
        <h1>✦ Admin</h1>
        <input placeholder="URL da API (ex: https://umsinaldefe.com.br)" value={url} onChange={(e) => setUrl(e.target.value)} />
        <input placeholder="Token (ADMIN_TOKEN)" type="password" value={tok} onChange={(e) => setTok(e.target.value)} />
        <button onClick={() => { if (tok) onLogin(url || API_BASE, tok); }}>Entrar</button>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${color || ''}`}>{value ?? '—'}</div>
    </div>
  );
}

function ServiceBadge({ name, on }) {
  return (
    <div className="svc">
      <span className={`svc-dot ${on ? 'on' : 'off'}`} />
      {name}: {on ? 'ativo' : 'off'}
    </div>
  );
}

function QueueTable({ items, token, apiBase, onRefresh }) {
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(null);

  const filtered = filter === 'all' ? items : items.filter((i) => i.status === filter);

  const updateStatus = async (id, status) => {
    setBusy(id);
    try {
      await fetch(`${apiBase}/api/admin/queue`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      onRefresh();
    } catch { /* ignore */ }
    setBusy(null);
  };

  return (
    <div className="section">
      <div className="section-title">
        Fila de conteúdo <span className="badge">{items.length} temas</span>
      </div>
      <div className="tabs">
        {['all', 'pending', 'done', 'error', 'skip'].map((t) => (
          <button key={t} className={`tab ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
            {t === 'all' ? 'Todos' : t} ({t === 'all' ? items.length : items.filter((i) => i.status === t).length})
          </button>
        ))}
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Keyword</th>
              <th>Tipo</th>
              <th>Volume</th>
              <th>SD</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td title={item.title}>
                  <strong>{item.keyword}</strong>
                  <br /><span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{item.slug}</span>
                </td>
                <td>{item.type}</td>
                <td>{item.volume ? `${(item.volume / 1000).toFixed(0)}k` : '—'}</td>
                <td>{item.sd ?? '—'}</td>
                <td><span className={`status ${item.status}`}>{item.status}</span></td>
                <td>
                  {item.status === 'error' && (
                    <button className="btn-sm" disabled={busy === item.id} onClick={() => updateStatus(item.id, 'pending')}>
                      Retry
                    </button>
                  )}
                  {item.status === 'pending' && (
                    <button className="btn-sm" disabled={busy === item.id} onClick={() => updateStatus(item.id, 'skip')}>
                      Skip
                    </button>
                  )}
                  {item.status === 'skip' && (
                    <button className="btn-sm" disabled={busy === item.id} onClick={() => updateStatus(item.id, 'pending')}>
                      Reativar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PostsTable({ posts }) {
  if (!posts?.length) return <p style={{ color: 'var(--muted)' }}>Nenhum post gerado ainda.</p>;
  return (
    <div className="section">
      <div className="section-title">
        Posts gerados <span className="badge">{posts.length}</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Categoria</th>
              <th>Keyword</th>
              <th>Imagem</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.slug}>
                <td><strong>{p.title}</strong><br /><span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{p.slug}</span></td>
                <td>{p.category}</td>
                <td>{p.keyword}</td>
                <td>{p.hasImage ? '✓' : '—'}</td>
                <td style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('pt-BR') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [apiBase, setApiBase] = useState('');
  const [token, setToken] = useState('');
  const [logged, setLogged] = useState(false);

  // Restaura sessão do sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('admin-session');
    if (saved) {
      const { apiBase: a, token: t } = JSON.parse(saved);
      setApiBase(a); setToken(t); setLogged(true);
    }
  }, []);

  const handleLogin = (url, tok) => {
    setApiBase(url); setToken(tok); setLogged(true);
    sessionStorage.setItem('admin-session', JSON.stringify({ apiBase: url, token: tok }));
  };

  if (!logged) return <Login onLogin={handleLogin} />;

  return <Dashboard apiBase={apiBase} token={token} onLogout={() => { setLogged(false); sessionStorage.removeItem('admin-session'); }} />;
}

function Dashboard({ apiBase, token, onLogout }) {
  const stats = useApi('/api/admin/stats', token);
  const queue = useApi('/api/admin/queue', token);
  const posts = useApi('/api/admin/posts', token);

  const s = stats.data;
  const q = queue.data;
  const p = posts.data;

  // Override fetch base
  const origFetch = globalThis.fetch;
  useEffect(() => {
    // noop
  }, [apiBase]);

  return (
    <>
      <div className="header">
        <span className="dot" />
        <h1>✦ Um Sinal de Fé · Admin</h1>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{apiBase}</span>
        <button className="btn-sm" onClick={onLogout}>Sair</button>
      </div>
      <div className="container">
        {/* Stats */}
        {s && (
          <>
            <div className="stats">
              <StatCard label="Total de páginas" value={s.content?.totalPages} />
              <StatCard label="Signals" value={s.content?.signals} />
              <StatCard label="Versículos" value={s.content?.verseTopics} />
              <StatCard label="Blog posts" value={s.content?.blogPosts} />
              <StatCard label="Fila: pendente" value={s.queue?.pending} color="yellow" />
              <StatCard label="Fila: gerado" value={s.queue?.done} color="green" />
              <StatCard label="Fila: erro" value={s.queue?.error} color="red" />
            </div>
            <div className="services">
              <ServiceBadge name="ElevenLabs TTS" on={s.services?.tts} />
              <ServiceBadge name="OpenAI" on={s.services?.openai} />
              <ServiceBadge name="Pexels" on={s.services?.pexels} />
            </div>
          </>
        )}

        {stats.loading && <p style={{ color: 'var(--muted)' }}>Carregando...</p>}
        {!stats.loading && !s && <p style={{ color: 'var(--red)' }}>Erro ao conectar na API. Verifique URL e token.</p>}

        {/* Queue */}
        {q?.items && (
          <QueueTable items={q.items} token={token} apiBase={apiBase} onRefresh={queue.refresh} />
        )}

        {/* Posts */}
        {p && <PostsTable posts={p.posts} />}
      </div>
    </>
  );
}
