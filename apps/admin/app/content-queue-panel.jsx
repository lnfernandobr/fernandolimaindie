'use client';
import { useState, useEffect, useCallback } from 'react';

const KIND_LABELS = {
  psalm: 'Salmo', prayer: 'Oração', devotional: 'Devocional',
  reflection: 'Reflexão', article: 'Blog', verse_collection: 'Bíblia',
};

const SEEDKIND_OPTIONS = [
  ['verse-collection', 'Bíblia (versículos por tema)'],
  ['psalm', 'Salmo'],
  ['prayer', 'Oração'],
  ['devotional', 'Devocional'],
  ['reflection', 'Reflexão'],
  ['article', 'Blog'],
];

const INTENT_OPTIONS = [
  'faith', 'anxiety', 'sleep', 'fear', 'gratitude', 'protection', 'hope',
  'family', 'finances', 'grief', 'morning', 'night', 'healing', 'forgiveness',
];

const FILTER_LABELS = { all: 'Todos', pending: 'Pendentes', published: 'Publicados', skipped: 'Pausados' };

function AddSeedForm({ apiFetch, onAdded, show, setShow }) {
  const [seedKind, setSeedKind] = useState('verse-collection');
  const [intent, setIntent] = useState('faith');
  const [keyword, setKeyword] = useState('');
  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const field = { padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'inherit', width: '100%' };

  if (!show) return <button className="btn-sm" onClick={() => setShow(true)} style={{ marginBottom: 12 }}>+ Adicionar tema</button>;

  const submit = async () => {
    if (!keyword.trim()) return;
    setBusy(true); setErr('');
    try {
      const res = await apiFetch('/generation/seeds', { method: 'POST', body: JSON.stringify({ seedKind, intent, keyword, title, brief }) });
      if (res.ok) { setKeyword(''); setTitle(''); setBrief(''); setShow(false); onAdded(); }
      else { const d = await res.json().catch(() => ({})); setErr(d.message || 'Falha ao adicionar.'); }
    } catch { setErr('Falha ao adicionar.'); }
    setBusy(false);
  };

  return (
    <div className="section" style={{ marginBottom: 12 }}>
      <div className="section-title">Novo tema na fila</div>
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr', marginBottom: 8 }}>
        <select value={seedKind} onChange={(e) => setSeedKind(e.target.value)} style={field}>
          {SEEDKIND_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={intent} onChange={(e) => setIntent(e.target.value)} style={field}>
          {INTENT_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <input placeholder="Keyword-alvo (ex.: versículos sobre paz)" value={keyword} onChange={(e) => setKeyword(e.target.value)} style={field} />
        <input placeholder="Título (opcional)" value={title} onChange={(e) => setTitle(e.target.value)} style={field} />
        <input placeholder="Brief / contexto pra IA (opcional)" value={brief} onChange={(e) => setBrief(e.target.value)} style={{ ...field, gridColumn: '1 / -1' }} />
      </div>
      {err && <p style={{ color: 'var(--red)', fontSize: '0.8rem' }}>{err}</p>}
      <button className="btn-sm" disabled={busy || !keyword.trim()} onClick={submit}>{busy ? 'Adicionando...' : 'Adicionar'}</button>
      <button className="btn-sm" onClick={() => setShow(false)} style={{ marginLeft: 8 }}>Cancelar</button>
    </div>
  );
}

export default function ContentQueuePanel({ session }) {
  const base = session?.coreApiUrl;
  const token = session?.coreApiToken;
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const apiFetch = useCallback(
    (path, opts = {}) =>
      fetch(`${base}/api/v1${path}`, {
        ...opts,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
      }),
    [base, token],
  );

  const load = useCallback(async () => {
    if (!base || !token) return;
    try {
      const res = await apiFetch('/generation/seeds');
      if (res.ok) { const d = await res.json(); setItems(d.items || []); setError(''); }
      else setError('Falha ao carregar a fila.');
    } catch { setError('Falha ao carregar a fila.'); }
  }, [apiFetch, base, token]);

  useEffect(() => { load(); }, [load]);

  if (!base || !token) return null;

  const patch = async (slug, body) => {
    setBusy(slug);
    try { await apiFetch(`/generation/seeds/${encodeURIComponent(slug)}`, { method: 'PATCH', body: JSON.stringify(body) }); await load(); }
    catch { setError('Falha ao salvar.'); }
    setBusy(null);
  };

  const remove = async (slug) => {
    if (!window.confirm('Remover este tema da fila?')) return;
    setBusy(slug);
    try { await apiFetch(`/generation/seeds/${encodeURIComponent(slug)}`, { method: 'DELETE' }); await load(); }
    catch { setError('Falha ao remover.'); }
    setBusy(null);
  };

  const list = items || [];
  const counts = {
    all: list.length,
    pending: list.filter((i) => !i.published && i.status === 'active').length,
    published: list.filter((i) => i.published).length,
    skipped: list.filter((i) => i.status === 'skipped').length,
  };
  const filtered = list.filter((i) => {
    if (filter === 'pending') return !i.published && i.status === 'active';
    if (filter === 'published') return i.published;
    if (filter === 'skipped') return i.status === 'skipped';
    return true;
  });
  const statusOf = (i) => (i.published ? 'done' : i.status === 'skipped' ? 'skip' : 'pending');
  const statusLabel = (i) => (i.published ? 'publicado' : i.status === 'skipped' ? 'pausado' : 'pendente');

  return (
    <div className="section">
      <div className="section-title">
        Fila de conteúdo <span className="badge">{list.length} temas</span>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 12 }}>
        O cron gera os pendentes por prioridade (número menor = primeiro). Pause, remova, reordene ou adicione temas.
      </p>

      <AddSeedForm apiFetch={apiFetch} onAdded={load} show={showAdd} setShow={setShowAdd} />

      <div className="tabs">
        {['pending', 'published', 'skipped', 'all'].map((t) => (
          <button key={t} className={`tab ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
            {FILTER_LABELS[t]} ({counts[t]})
          </button>
        ))}
      </div>

      {error && <p style={{ color: 'var(--red)', fontSize: '0.82rem' }}>{error}</p>}
      {items === null && <p style={{ color: 'var(--muted)' }}>Carregando...</p>}

      {items !== null && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Prior.</th><th>Tema</th><th>Tipo</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.slug}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {i.priority}{' '}
                    <button className="btn-sm" disabled={busy === i.slug} onClick={() => patch(i.slug, { priority: Math.max(1, i.priority - 1) })} title="Subir prioridade">▲</button>
                    <button className="btn-sm" disabled={busy === i.slug} onClick={() => patch(i.slug, { priority: i.priority + 1 })} title="Descer prioridade">▼</button>
                  </td>
                  <td title={i.keyword}>
                    <strong>{i.title}</strong>
                    <br /><span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{i.slug}</span>
                  </td>
                  <td>{KIND_LABELS[i.signalKind] ?? i.signalKind}</td>
                  <td><span className={`status ${statusOf(i)}`}>{statusLabel(i)}</span></td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn-sm" disabled={busy === i.slug} onClick={() => patch(i.slug, { priority: 1 })} title="Gerar a seguir (vai pro topo)">▶ Topo</button>
                    {i.status === 'skipped'
                      ? <button className="btn-sm" disabled={busy === i.slug} onClick={() => patch(i.slug, { status: 'active' })}>Reativar</button>
                      : <button className="btn-sm" disabled={busy === i.slug} onClick={() => patch(i.slug, { status: 'skipped' })}>Pausar</button>}
                    <button className="btn-sm" disabled={busy === i.slug} onClick={() => remove(i.slug)} title="Remover">🗑</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ color: 'var(--muted)', textAlign: 'center', padding: 16 }}>Nada aqui.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
