'use client';
import { useState, useEffect, useCallback } from 'react';

// ── API hook ─────────────────────────────────────────────────────────

function useApi(path, session) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch(`${session.apiUrl}${path}`, {
        headers: { Authorization: `Bearer ${session.apiToken}` },
      });
      if (res.ok) setData(await res.json());
      else setData(null);
    } catch { setData(null); }
    setLoading(false);
  }, [path, session]);
  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, refresh };
}

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

// ── Components ───────────────────────────────────────────────────────

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

function QueueTable({ items, session, onRefresh }) {
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(null);

  const filtered = filter === 'all' ? items : items.filter((i) => i.status === filter);

  const updateStatus = async (id, status) => {
    setBusy(id);
    try {
      await fetch(`${session.apiUrl}/api/admin/queue`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${session.apiToken}`, 'Content-Type': 'application/json' },
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
                    <button className="btn-sm" disabled={busy === item.id} onClick={() => updateStatus(item.id, 'pending')}>Retry</button>
                  )}
                  {item.status === 'pending' && (
                    <button className="btn-sm" disabled={busy === item.id} onClick={() => updateStatus(item.id, 'skip')}>Skip</button>
                  )}
                  {item.status === 'skip' && (
                    <button className="btn-sm" disabled={busy === item.id} onClick={() => updateStatus(item.id, 'pending')}>Reativar</button>
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

// ── Main ─────────────────────────────────────────────────────────────

function CronConfigPanel({ session }) {
  const { data, refresh } = useApi('/api/admin/cron-config', session);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (data) setDraft(data); }, [data]);
  if (!draft) return null;

  const sections = ['salmo', 'oracao', 'biblia', 'blog', 'devocional', 'reflexao'];
  const labels = {
    salmo: 'Salmos', oracao: 'Orações', biblia: 'Bíblia (temas)',
    blog: 'Blog', devocional: 'Devocionais', reflexao: 'Reflexões',
  };
  const total = sections.reduce((a, s) => a + (Number(draft.perSection?.[s]) || 0), 0);

  const setN = (s, v) =>
    setDraft((d) => ({
      ...d,
      perSection: { ...d.perSection, [s]: Math.max(0, Math.min(20, parseInt(v, 10) || 0)) },
    }));

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`${session.apiUrl}/api/admin/cron-config`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${session.apiToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: draft.enabled, imageProvider: draft.imageProvider, perSection: draft.perSection }),
      });
      if (res.ok) { setSaved(true); refresh(); }
    } catch { /* ignore */ }
    setSaving(false);
  };

  return (
    <div className="section">
      <div className="section-title">
        Geração automática (cron) <span className="badge">{total} por execução</span>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 14 }}>
        Quantos itens o cron gera por seção a cada execução. Use 0 pra pausar uma seção.
      </p>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: '0.9rem' }}>
        <input
          type="checkbox"
          checked={!!draft.enabled}
          onChange={(e) => setDraft((d) => ({ ...d, enabled: e.target.checked }))}
        />
        Geração ativada
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: '0.9rem' }}>
        Imagem:
        <select
          value={draft.imageProvider || 'openai'}
          onChange={(e) => setDraft((d) => ({ ...d, imageProvider: e.target.value }))}
          style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'inherit' }}
        >
          <option value="openai">OpenAI (gerada, qualidade)</option>
          <option value="pexels">Pexels (banco grátis)</option>
          <option value="none">Sem imagem</option>
        </select>
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 16 }}>
        {sections.map((s) => (
          <div key={s} className="stat" style={{ opacity: draft.enabled ? 1 : 0.5 }}>
            <div className="stat-label">{labels[s]}</div>
            <input
              type="number"
              min="0"
              max="20"
              value={draft.perSection?.[s] ?? 0}
              disabled={!draft.enabled}
              onChange={(e) => setN(s, e.target.value)}
              style={{ width: '100%', marginTop: 6, padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'inherit', fontSize: '1.1rem' }}
            />
          </div>
        ))}
      </div>
      <button className="btn-sm" disabled={saving} onClick={save}>
        {saving ? 'Salvando...' : 'Salvar configuração'}
      </button>
      {saved && <span style={{ color: '#46a758', marginLeft: 10, fontSize: '0.82rem' }}>Salvo ✓</span>}
    </div>
  );
}

export default function AdminPage() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('admin-session');
    if (saved) {
      try { setSession(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const handleLogin = (data) => {
    const s = { user: data.user, apiUrl: data.apiUrl, apiToken: data.apiToken };
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

function Dashboard({ session, onLogout }) {
  const stats = useApi('/api/admin/stats', session);
  const queue = useApi('/api/admin/queue', session);
  const posts = useApi('/api/admin/posts', session);

  const s = stats.data;
  const q = queue.data;
  const p = posts.data;

  return (
    <>
      <div className="header">
        <span className="dot" />
        <h1>✦ Um Sinal de Fé · Admin</h1>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
          Logado como <strong>{session.user}</strong>
        </span>
        <button className="btn-sm" onClick={onLogout}>Sair</button>
      </div>
      <div className="container">
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
        {!stats.loading && !s && <p style={{ color: 'var(--red)' }}>Erro ao conectar na API. Verifique se o umsinaldefe está rodando.</p>}

        <CronConfigPanel session={session} />

        {q?.items && <QueueTable items={q.items} session={session} onRefresh={queue.refresh} />}

        {p && <PostsTable posts={p.posts} />}
      </div>
    </>
  );
}
