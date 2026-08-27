'use client';
import { useState, useEffect, useCallback, Fragment } from 'react';
import ContentQueuePanel from './content-queue-panel.jsx';

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

function AddItemForm({ session, onAdded }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('biblia');
  const [keyword, setKeyword] = useState('');
  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [busy, setBusy] = useState(false);

  const field = { padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: 'rgba(0,0,0,0.03)', color: 'inherit', width: '100%' };

  const submit = async () => {
    if (!keyword.trim()) return;
    setBusy(true);
    try {
      await fetch(`${session.apiUrl}/api/admin/queue`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.apiToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, keyword, title, brief }),
      });
      setKeyword(''); setTitle(''); setBrief(''); setOpen(false);
      onAdded();
    } catch { /* ignore */ }
    setBusy(false);
  };

  if (!open) {
    return <button className="btn-sm" onClick={() => setOpen(true)} style={{ marginBottom: 12 }}>+ Adicionar item à fila</button>;
  }
  return (
    <div className="section" style={{ marginBottom: 12 }}>
      <div className="section-title">Novo item na fila</div>
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr', marginBottom: 8 }}>
        <select value={type} onChange={(e) => setType(e.target.value)} style={field}>
          <option value="biblia">Bíblia (versículos por tema)</option>
          <option value="salmo">Salmo</option>
          <option value="oracao">Oração</option>
          <option value="devocional">Devocional</option>
          <option value="blog">Blog</option>
        </select>
        <input placeholder="Keyword-alvo (ex.: versículos sobre paz)" value={keyword} onChange={(e) => setKeyword(e.target.value)} style={field} />
        <input placeholder="Título (opcional)" value={title} onChange={(e) => setTitle(e.target.value)} style={field} />
        <input placeholder="Brief (opcional)" value={brief} onChange={(e) => setBrief(e.target.value)} style={field} />
      </div>
      <button className="btn-sm" disabled={busy || !keyword.trim()} onClick={submit}>{busy ? 'Adicionando...' : 'Adicionar'}</button>
      <button className="btn-sm" onClick={() => setOpen(false)} style={{ marginLeft: 8 }}>Cancelar</button>
    </div>
  );
}

function QueueTable({ items, session, onRefresh }) {
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(null);

  const filtered = filter === 'all' ? items : items.filter((i) => i.status === filter);

  const patchItem = async (id, body) => {
    setBusy(id);
    try {
      await fetch(`${session.apiUrl}/api/admin/queue`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${session.apiToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...body }),
      });
      onRefresh();
    } catch { /* ignore */ }
    setBusy(null);
  };

  const removeItem = async (id) => {
    if (!window.confirm('Remover este item da fila?')) return;
    setBusy(id);
    try {
      await fetch(`${session.apiUrl}/api/admin/queue`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.apiToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      onRefresh();
    } catch { /* ignore */ }
    setBusy(null);
  };

  const reschedule = (id) => {
    const v = window.prompt('Reagendar para (AAAA-MM-DD). Deixe vazio para gerar normalmente:');
    if (v === null) return;
    patchItem(id, { scheduledFor: v ? new Date(`${v}T06:00:00Z`).toISOString() : null });
  };

  const cycleAudio = (item) => {
    const next = { auto: 'on', on: 'off', off: 'auto' };
    patchItem(item.id, { audio: next[item.audio || 'auto'] });
  };

  const editItem = (item) => {
    const title = window.prompt('Título:', item.title || '');
    if (title === null) return;
    const keyword = window.prompt('Keyword-alvo (SEO):', item.keyword || '');
    if (keyword === null) return;
    const brief = window.prompt('Brief (contexto pra IA):', item.brief || '');
    if (brief === null) return;
    patchItem(item.id, { title, keyword, brief });
  };

  const audioLabel = (a) => (a === 'off' ? '🔇 off' : a === 'on' ? '🔊 on' : '🎧 auto');

  return (
    <div className="section">
      <div className="section-title">
        Fila de conteúdo <span className="badge">{items.length} temas</span>
      </div>
      <AddItemForm session={session} onAdded={onRefresh} />
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
              <th>Prior.</th>
              <th>Keyword</th>
              <th>Tipo</th>
              <th>Áudio</th>
              <th>Agenda</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {item.priority ?? '—'}{' '}
                  <button className="btn-sm" disabled={busy === item.id} onClick={() => patchItem(item.id, { action: 'up' })} title="Subir prioridade">▲</button>
                  <button className="btn-sm" disabled={busy === item.id} onClick={() => patchItem(item.id, { action: 'down' })} title="Descer prioridade">▼</button>
                </td>
                <td title={item.title}>
                  <strong>{item.keyword}</strong>
                  <br /><span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{item.slug}</span>
                </td>
                <td>{item.type}</td>
                <td>
                  <button className="btn-sm" disabled={busy === item.id} onClick={() => cycleAudio(item)} title="Alternar áudio (auto/on/off)">
                    {audioLabel(item.audio)}
                  </button>
                </td>
                <td style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                  {item.scheduledFor ? new Date(item.scheduledFor).toLocaleDateString('pt-BR') : '—'}
                </td>
                <td><span className={`status ${item.status}`}>{item.status}</span></td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button className="btn-sm" disabled={busy === item.id} onClick={() => patchItem(item.id, { action: 'runNow' })} title="Gerar a seguir (vai pro topo da fila)">▶ Agora</button>
                  {item.status === 'skip'
                    ? <button className="btn-sm" disabled={busy === item.id} onClick={() => patchItem(item.id, { action: 'reactivate' })}>Reativar</button>
                    : <button className="btn-sm" disabled={busy === item.id} onClick={() => patchItem(item.id, { action: 'skip' })}>Pular</button>}
                  {item.status === 'error' && (
                    <button className="btn-sm" disabled={busy === item.id} onClick={() => patchItem(item.id, { action: 'reactivate' })}>Retry</button>
                  )}
                  <button className="btn-sm" disabled={busy === item.id} onClick={() => editItem(item)} title="Editar título/keyword/brief">✎</button>
                  <button className="btn-sm" disabled={busy === item.id} onClick={() => reschedule(item.id)} title="Reagendar">📅</button>
                  <button className="btn-sm" disabled={busy === item.id} onClick={() => removeItem(item.id)} title="Remover">🗑</button>
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

// Cotas por tipo (seedKind), na ordem/rótulos que o admin mostra.
const QUOTA_KINDS = [
  ['verse-collection', 'Bíblia'],
  ['psalm', 'Salmo'],
  ['prayer', 'Oração'],
  ['devotional', 'Devocional'],
  ['reflection', 'Reflexão'],
  ['article', 'Blog'],
];

const QUOTA_INPUT_STYLE = {
  width: 64, padding: '6px 8px', borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)',
  color: 'inherit', fontSize: '1rem', textAlign: 'center',
};

function CronConfigPanel({ session }) {
  const base = session?.coreApiUrl;
  const token = session?.coreApiToken;
  const [quotas, setQuotas] = useState(null);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    if (!base || !token) return;
    try {
      const [cfgRes, stRes] = await Promise.all([
        fetch(`${base}/api/v1/generation/config`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${base}/api/v1/generation/status`),
      ]);
      if (cfgRes.ok) setQuotas((await cfgRes.json()).dailyQuotas ?? {});
      if (stRes.ok) setStatus(await stRes.json());
    } catch { setError('Falha ao carregar a config do cron.'); }
  };

  useEffect(() => { load(); }, [base, token]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!base || !token) {
    return (
      <div className="section">
        <div className="section-title">Geração automática (cron)</div>
        <p style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
          Sessão sem acesso à API. Refaça o login pra editar a geração.
        </p>
      </div>
    );
  }
  if (quotas === null) return null;

  const total = QUOTA_KINDS.reduce((a, [k]) => a + (quotas[k] ?? 0), 0);

  const setQuota = (k, v) => {
    const n = Math.max(0, Math.min(20, parseInt(v, 10) || 0));
    setQuotas((q) => ({ ...q, [k]: n }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const res = await fetch(`${base}/api/v1/generation/config`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyQuotas: quotas }),
      });
      if (res.ok) { setSaved(true); load(); } else { setError('Não foi possível salvar.'); }
    } catch { setError('Não foi possível salvar.'); }
    setSaving(false);
  };

  return (
    <div className="section">
      <div className="section-title">
        Geração automática (cron) <span className="badge">{total} por dia</span>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 14 }}>
        Quantos conteúdos o cron gera por dia, por tipo. Cota 0 = tipo desligado (ainda dá pra gerar manual na fila).
      </p>
      {status && (
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 16, fontSize: '0.85rem', color: 'var(--muted)' }}>
          <span>Cron: <strong style={{ color: status.enabled ? '#46a758' : '#e5484d' }}>{status.enabled ? 'ativado' : 'desativado'}</strong></span>
          <span>Agenda: <strong>{status.schedule}</strong> UTC</span>
          <span>Pendentes: <strong>{status.pendingSeeds}</strong></span>
        </div>
      )}
      <div
        style={{
          display: 'grid', gridTemplateColumns: 'auto 64px auto',
          gap: '8px 14px', alignItems: 'center', maxWidth: 360, marginBottom: 16,
        }}
      >
        {QUOTA_KINDS.map(([k, label]) => (
          <Fragment key={k}>
            <label htmlFor={`quota-${k}`} style={{ fontSize: '0.9rem' }}>{label}</label>
            <input
              id={`quota-${k}`}
              type="number" min="0" max="20"
              value={quotas[k] ?? 0}
              onChange={(e) => setQuota(k, e.target.value)}
              style={QUOTA_INPUT_STYLE}
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
              {status?.pendingByKind?.[k] ?? 0} pendentes
            </span>
          </Fragment>
        ))}
        <strong style={{ fontSize: '0.9rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 8 }}>Total/dia</strong>
        <strong style={{ textAlign: 'center', fontSize: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 8 }}>{total}</strong>
        <span style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
      </div>
      <button className="btn-sm" disabled={saving} onClick={save}>
        {saving ? 'Salvando...' : 'Salvar'}
      </button>
      {saved && <span style={{ color: '#46a758', marginLeft: 10, fontSize: '0.82rem' }}>Salvo ✓</span>}
      {error && <span style={{ color: '#e5484d', marginLeft: 10, fontSize: '0.82rem' }}>{error}</span>}
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

const CONTENT_KINDS = [
  ['psalm', 'Salmos'],
  ['prayer', 'Orações'],
  ['devotional', 'Devocionais'],
  ['reflection', 'Reflexões'],
  ['article', 'Blog'],
  ['verse_collection', 'Bíblia'],
];

function ContentDashboard({ session }) {
  const base = session?.coreApiUrl;
  const [status, setStatus] = useState(null);
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!base) { setLoading(false); return; }
      setLoading(true);
      setError('');
      try {
        const results = await Promise.all([
          fetch(`${base}/api/v1/generation/status`).then((r) => (r.ok ? r.json() : null)),
          ...CONTENT_KINDS.map(([k]) =>
            fetch(`${base}/api/v1/signals?kind=${k}&limit=1`).then((r) => (r.ok ? r.json() : { total: 0 })),
          ),
        ]);
        if (cancel) return;
        setStatus(results[0]);
        setCounts(CONTENT_KINDS.map(([k, label], i) => ({ k, label, total: results[i + 1]?.total ?? 0 })));
      } catch {
        if (!cancel) setError('Erro ao conectar na API.');
      }
      if (!cancel) setLoading(false);
    })();
    return () => { cancel = true; };
  }, [base]);

  const totalSignals = counts ? counts.reduce((a, c) => a + c.total, 0) : null;
  const lastRun = status?.recentRuns?.[0];

  return (
    <>
      {loading && <p style={{ color: 'var(--muted)' }}>Carregando...</p>}
      {error && !loading && <p style={{ color: 'var(--red)' }}>{error}</p>}

      {counts && (
        <div className="stats">
          <StatCard label="Conteúdos publicados" value={totalSignals} color="green" />
          {counts.map((c) => <StatCard key={c.k} label={c.label} value={c.total} />)}
          <StatCard label="Pendentes (cron)" value={status?.pendingSeeds} color="yellow" />
        </div>
      )}

      {lastRun && (
        <p style={{ color: 'var(--muted)', fontSize: '0.82rem', margin: '10px 0 4px' }}>
          Última geração: {new Date(lastRun.ranAt).toLocaleString('pt-BR')} — {lastRun.created} criados
          {lastRun.failed ? `, ${lastRun.failed} falhas` : ''}.
        </p>
      )}

      <CronConfigPanel session={session} />

      <ContentQueuePanel session={session} />
    </>
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
        <ContentDashboard session={session} />
      </div>
    </>
  );
}
