'use client';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

const KIND_LABELS = {
  psalm: 'Salmo',
  prayer: 'Oração',
  devotional: 'Devocional',
  reflection: 'Reflexão',
  article: 'Blog',
  verse_collection: 'Bíblia',
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

const FILTER_LABELS = {
  pending: 'Pendentes',
  generating: 'Gerando',
  error: 'Erros',
  published: 'Publicados',
  skipped: 'Pausados',
  all: 'Todos',
};

const STEP_LABELS = {
  check: 'Verifica signal existente',
  llm: 'Geração (Claude Sonnet)',
  save: 'Persistir signal',
};

const FIELD_STYLE = {
  padding: '6px 8px',
  borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.05)',
  color: 'inherit',
  width: '100%',
};

const coreFetch = async (session, path, init = {}) => {
  if (!session?.coreApiUrl || !session?.coreApiToken) {
    throw new Error('Sem acesso à API principal. Confira CORE_API_URL / CORE_API_PASSWORD.');
  }
  const res = await fetch(`${session.coreApiUrl}/api/v1${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.coreApiToken}`,
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.message ?? `HTTP ${res.status}`);
  return data;
};

function fmtDuration(ms) {
  if (ms == null || ms === 0) return '—';
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(ms < 10000 ? 2 : 1)} s`;
}

function copyToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(text);
}

function AddSeedForm({ session, onAdded, show, setShow }) {
  const [seedKind, setSeedKind] = useState('verse-collection');
  const [intent, setIntent] = useState('faith');
  const [keyword, setKeyword] = useState('');
  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  if (!show) {
    return (
      <button className="btn-sm" onClick={() => setShow(true)} style={{ marginBottom: 12 }}>
        + Adicionar tema
      </button>
    );
  }

  const submit = async () => {
    if (!keyword.trim()) return;
    setBusy(true);
    setErr('');
    try {
      await coreFetch(session, '/generation/seeds', {
        method: 'POST',
        body: JSON.stringify({ seedKind, intent, keyword, title, brief }),
      });
      setKeyword('');
      setTitle('');
      setBrief('');
      setShow(false);
      onAdded();
    } catch (e) {
      setErr(e.message || 'Falha ao adicionar.');
    }
    setBusy(false);
  };

  return (
    <div className="section" style={{ marginBottom: 12 }}>
      <div className="section-title">Novo tema na fila</div>
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr', marginBottom: 8 }}>
        <select value={seedKind} onChange={(e) => setSeedKind(e.target.value)} style={FIELD_STYLE}>
          {SEEDKIND_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={intent} onChange={(e) => setIntent(e.target.value)} style={FIELD_STYLE}>
          {INTENT_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <input placeholder="Keyword-alvo (ex.: versículos sobre paz)" value={keyword} onChange={(e) => setKeyword(e.target.value)} style={FIELD_STYLE} />
        <input placeholder="Título (opcional)" value={title} onChange={(e) => setTitle(e.target.value)} style={FIELD_STYLE} />
        <input placeholder="Brief / contexto pra IA (opcional)" value={brief} onChange={(e) => setBrief(e.target.value)} style={{ ...FIELD_STYLE, gridColumn: '1 / -1' }} />
      </div>
      {err && <p style={{ color: 'var(--red)', fontSize: '0.8rem' }}>{err}</p>}
      <button className="btn-sm" disabled={busy || !keyword.trim()} onClick={submit}>
        {busy ? 'Adicionando...' : 'Adicionar'}
      </button>
      <button className="btn-sm" onClick={() => setShow(false)} style={{ marginLeft: 8 }}>Cancelar</button>
    </div>
  );
}

function InlineSignalInfo({ session, slug }) {
  const [signal, setSignal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    coreFetch(session, `/signals/${encodeURIComponent(slug)}`)
      .then((s) => { if (!cancelled) setSignal(s); })
      .catch((e) => { if (!cancelled) setErr(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [session, slug]);

  if (loading) return <div style={{ padding: '10px 0', color: 'var(--muted)', fontSize: '0.78rem' }}>Carregando signal…</div>;
  if (err) return <div style={{ padding: '10px 0', color: 'var(--red)', fontSize: '0.78rem' }}>Erro: {err}</div>;
  if (!signal) return null;

  return (
    <div className="ig-post-inline">
      <div className="ig-post-inline-head">
        <strong>{signal.title}</strong>
        <span style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>/{signal.slug}</span>
      </div>

      {signal.answer && (
        <div className="ig-post-block">
          <div className="ig-post-label">Resposta direta</div>
          <div className="ig-caption-box">{signal.answer}</div>
        </div>
      )}

      {signal.summary && (
        <div className="ig-post-block">
          <div className="ig-post-label">Resumo</div>
          <div className="ig-caption-box">{signal.summary}</div>
        </div>
      )}

      {signal.bodyHtml && (
        <div className="ig-post-block">
          <div className="ig-post-label">
            Conteúdo
            <button className="btn-sm" style={{ marginLeft: 8 }} onClick={() => copyToClipboard(signal.bodyHtml)}>
              Copiar HTML
            </button>
          </div>
          <div
            className="ig-caption-box"
            style={{ maxHeight: 320, overflowY: 'auto' }}
            dangerouslySetInnerHTML={{ __html: signal.bodyHtml }}
          />
        </div>
      )}

      {signal.verses?.length > 0 && (
        <div className="ig-post-block">
          <div className="ig-post-label">Versículos ({signal.verses.length})</div>
          <div className="ig-caption-box" style={{ maxHeight: 240, overflowY: 'auto' }}>
            {signal.verses.map((v, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <strong>{v.ref}</strong> — {v.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {signal.faq?.length > 0 && (
        <div className="ig-post-block">
          <div className="ig-post-label">FAQ ({signal.faq.length})</div>
          <div className="ig-caption-box" style={{ maxHeight: 240, overflowY: 'auto' }}>
            {signal.faq.map((f, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <strong>{f.question}</strong>
                <div style={{ color: 'var(--muted)', marginTop: 2 }}>{f.answer}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RunLog({ session, item }) {
  const log = item.runLog ?? [];
  const running = item.runStatus === 'generating';

  if (!log.length && !running) {
    return (
      <div style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: '0.78rem' }}>
        Sem log ainda. Rode a geração pra ver os tempos.
      </div>
    );
  }

  return (
    <div className="ig-log">
      <div className="ig-log-head">
        <span>
          Execução · total{' '}
          <strong>{item.runDurationMs ? fmtDuration(item.runDurationMs) : '—'}</strong>
        </span>
        {item.runStartedAt && (
          <span style={{ color: 'var(--muted)' }}>
            início {new Date(item.runStartedAt).toLocaleTimeString('pt-BR')}
          </span>
        )}
      </div>
      <ol className="ig-log-list">
        {log.map((e, idx) => (
          <li key={idx} className={`ig-log-item ${e.status}`}>
            <span className="ig-log-icon">{e.status === 'ok' ? '✓' : '✕'}</span>
            <span className="ig-log-step">{e.label || STEP_LABELS[e.step] || e.step}</span>
            <span className="ig-log-dur">{fmtDuration(e.durationMs)}</span>
            {e.message && <span className="ig-log-msg">{e.message}</span>}
          </li>
        ))}
        {running && (
          <li className="ig-log-item running">
            <span className="ig-log-icon"><span className="ig-spinner" /></span>
            <span className="ig-log-step">executando…</span>
            <span className="ig-log-dur">—</span>
          </li>
        )}
      </ol>
      {item.runStatus === 'done' && item.lastSignalSlug && (
        <InlineSignalInfo session={session} slug={item.lastSignalSlug} />
      )}
      {item.runStatus === 'error' && item.lastError && (
        <div style={{ padding: '10px 0 0', color: 'var(--red)', fontSize: '0.78rem' }}>
          Último erro: {item.lastError}
        </div>
      )}
    </div>
  );
}

const seedDisplayStatus = (item) => {
  if (item.runStatus === 'generating') return 'generating';
  if (item.runStatus === 'error') return 'error';
  if (item.published) return 'publicado';
  if (item.status === 'skipped') return 'pausado';
  return 'pendente';
};

export default function ContentQueuePanel({ session }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const refresh = useCallback(async () => {
    if (!session?.coreApiUrl || !session?.coreApiToken) return;
    setLoading(true);
    try {
      const res = await coreFetch(session, '/generation/seeds');
      setData(res);
      setError('');
    } catch (e) {
      setError(e.message || 'Falha ao carregar a fila.');
    }
    setLoading(false);
  }, [session]);

  useEffect(() => { refresh(); }, [refresh]);

  const items = data?.items ?? [];
  const anyGenerating = useMemo(() => items.some((i) => i.runStatus === 'generating'), [items]);

  useEffect(() => {
    if (!anyGenerating) return undefined;
    const id = setInterval(() => { refresh(); }, 2500);
    return () => clearInterval(id);
  }, [anyGenerating, refresh]);

  const counts = useMemo(() => ({
    all: items.length,
    pending: items.filter((i) => !i.published && i.status !== 'skipped' && i.runStatus !== 'generating' && i.runStatus !== 'error').length,
    generating: items.filter((i) => i.runStatus === 'generating').length,
    error: items.filter((i) => i.runStatus === 'error').length,
    published: items.filter((i) => i.published).length,
    skipped: items.filter((i) => i.status === 'skipped').length,
  }), [items]);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'generating') return items.filter((i) => i.runStatus === 'generating');
    if (filter === 'error') return items.filter((i) => i.runStatus === 'error');
    if (filter === 'published') return items.filter((i) => i.published);
    if (filter === 'skipped') return items.filter((i) => i.status === 'skipped');
    return items.filter((i) => !i.published && i.status !== 'skipped' && i.runStatus !== 'generating' && i.runStatus !== 'error');
  }, [filter, items]);

  if (!session?.coreApiToken) return null;

  const patch = async (slug, body) => {
    setBusy(slug);
    try {
      await coreFetch(session, `/generation/seeds/${encodeURIComponent(slug)}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      await refresh();
    } catch (e) {
      setError(e.message || 'Falha ao salvar.');
    }
    setBusy(null);
  };

  const remove = async (slug) => {
    if (!window.confirm('Remover este tema da fila?')) return;
    setBusy(slug);
    try {
      await coreFetch(session, `/generation/seeds/${encodeURIComponent(slug)}`, { method: 'DELETE' });
      await refresh();
    } catch (e) {
      setError(e.message || 'Falha ao remover.');
    }
    setBusy(null);
  };

  const runNow = async (slug, { force } = {}) => {
    setBusy(slug);
    setError('');
    try {
      await coreFetch(session, `/generation/seeds/${encodeURIComponent(slug)}/run`, {
        method: 'POST',
        body: JSON.stringify({ force: !!force }),
      });
      setExpanded(slug);
      await refresh();
    } catch (e) {
      setError(e.message || 'Falha ao disparar geração.');
    }
    setBusy(null);
  };

  const editItem = async (item) => {
    const title = window.prompt('Título:', item.title || '');
    if (title === null) return;
    const brief = window.prompt('Brief / contexto:', item.brief || '');
    if (brief === null) return;
    await patch(item.slug, { title, brief });
  };

  return (
    <div className="section">
      <div className="section-title">
        Fila de conteúdo <span className="badge">{items.length} temas</span>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 12 }}>
        O cron gera os pendentes por prioridade (número menor = primeiro). Pause, remova, reordene, adicione ou gere agora.
      </p>

      <AddSeedForm session={session} onAdded={refresh} show={showAdd} setShow={setShowAdd} />

      <div className="tabs">
        {['pending', 'generating', 'error', 'published', 'skipped', 'all'].map((t) => (
          <button key={t} className={`tab ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
            {FILTER_LABELS[t]} ({counts[t]})
          </button>
        ))}
      </div>

      {error && <p style={{ color: 'var(--red)', fontSize: '0.82rem' }}>{error}</p>}
      {loading && data === null && <p style={{ color: 'var(--muted)' }}>Carregando...</p>}

      {data !== null && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Prior.</th>
                <th>Tema</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Atualizado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => {
                const isOpen = expanded === i.slug;
                const isRunning = i.runStatus === 'generating';
                const hasLog = (i.runLog ?? []).length > 0 || isRunning;
                const displayStatus = seedDisplayStatus(i);
                return (
                  <Fragment key={i.slug}>
                    <tr>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {i.priority}{' '}
                        <button
                          className="btn-sm"
                          disabled={busy === i.slug}
                          onClick={() => patch(i.slug, { priority: Math.max(1, i.priority - 1) })}
                          title="Subir prioridade"
                        >
                          ▲
                        </button>
                        <button
                          className="btn-sm"
                          disabled={busy === i.slug}
                          onClick={() => patch(i.slug, { priority: i.priority + 1 })}
                          title="Descer prioridade"
                        >
                          ▼
                        </button>
                      </td>
                      <td title={i.keyword}>
                        <strong>{i.title}</strong>
                        <br />
                        <span style={{ color: 'var(--muted)', fontSize: '0.74rem' }}>{i.slug}</span>
                        {i.brief && (
                          <>
                            <br />
                            <span style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>{i.brief}</span>
                          </>
                        )}
                      </td>
                      <td>{KIND_LABELS[i.signalKind] ?? i.signalKind}</td>
                      <td>
                        <span className={`status ${displayStatus}`}>
                          {displayStatus}
                          {isRunning && <span className="ig-pulse" />}
                        </span>
                        {i.runDurationMs > 0 && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 2 }}>
                            {fmtDuration(i.runDurationMs)}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                        {i.updatedAt ? new Date(i.updatedAt).toLocaleString('pt-BR') : '—'}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button
                          className="btn-sm"
                          disabled={busy === i.slug || isRunning}
                          onClick={() => runNow(i.slug, { force: i.published })}
                          title={i.published ? 'Regenerar (force)' : 'Gerar agora'}
                        >
                          ▶ {i.published ? 'Regerar' : 'Gerar'}
                        </button>
                        <button
                          className="btn-sm"
                          disabled={busy === i.slug}
                          onClick={() => patch(i.slug, { priority: 1 })}
                          title="Sobe pro topo da fila"
                        >
                          ⇧ Topo
                        </button>
                        {i.status === 'skipped' ? (
                          <button className="btn-sm" disabled={busy === i.slug} onClick={() => patch(i.slug, { status: 'active' })}>
                            Reativar
                          </button>
                        ) : i.runStatus === 'error' ? (
                          <button className="btn-sm" disabled={busy === i.slug} onClick={() => runNow(i.slug, { force: true })}>
                            Retry
                          </button>
                        ) : (
                          <button className="btn-sm" disabled={busy === i.slug} onClick={() => patch(i.slug, { status: 'skipped' })}>
                            Pausar
                          </button>
                        )}
                        <button
                          className={`btn-sm ${isOpen ? 'active' : ''}`}
                          onClick={() => setExpanded(isOpen ? null : i.slug)}
                          title="Ver log de execução"
                          disabled={!hasLog && i.runStatus !== 'done'}
                        >
                          ⓘ Log
                        </button>
                        <button className="btn-sm" disabled={busy === i.slug} onClick={() => editItem(i)} title="Editar">
                          ✎
                        </button>
                        <button className="btn-sm" disabled={busy === i.slug} onClick={() => remove(i.slug)} title="Remover">
                          🗑
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="ig-log-row">
                        <td colSpan={6}>
                          <RunLog session={session} item={i} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ color: 'var(--muted)', textAlign: 'center', padding: 16 }}>
                    Nada aqui.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
