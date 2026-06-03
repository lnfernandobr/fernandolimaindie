'use client';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

const QUEUE_STATUSES = ['all', 'pending', 'generating', 'done', 'error', 'skip'];

const coreFetch = async (session, path, init = {}) => {
  if (!session?.coreApiUrl || !session?.coreApiToken) {
    throw new Error('Sem acesso à API principal. Confira CORE_API_URL / CORE_API_PASSWORD.');
  }
  const res = await fetch(`${session.coreApiUrl}/api/v1/instagram${path}`, {
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

const useCoreData = (session, path, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const refresh = useCallback(async () => {
    if (path === null) return;
    setLoading(true);
    setError(null);
    try {
      const value = await coreFetch(session, path);
      setData(value);
    } catch (e) {
      setError(e.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [session, path]);
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, loading, error, refresh, setData };
};

const emptyChannelForm = () => ({
  handle: '',
  displayName: '',
  niche: '',
  brief: '',
  tone: '',
  captionStyle: '',
  slidesPerCarousel: 5,
  active: true,
});

const fromChannel = (channel) => ({
  handle: channel.handle,
  displayName: channel.displayName,
  niche: channel.niche ?? '',
  brief: channel.brief ?? '',
  tone: channel.tone ?? '',
  captionStyle: channel.captionStyle ?? '',
  slidesPerCarousel: channel.slidesPerCarousel ?? 5,
  active: channel.active !== false,
});

const toPayload = (form) => ({
  handle: form.handle.trim().toLowerCase(),
  displayName: form.displayName.trim(),
  niche: form.niche.trim(),
  brief: form.brief.trim(),
  tone: form.tone.trim() || undefined,
  captionStyle: form.captionStyle.trim() || undefined,
  slidesPerCarousel: Number(form.slidesPerCarousel) || 5,
  active: !!form.active,
});

function ChannelForm({ session, channel, onSaved, onCancel, onDeleted }) {
  const [form, setForm] = useState(() => (channel ? fromChannel(channel) : emptyChannelForm()));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    setForm(channel ? fromChannel(channel) : emptyChannelForm());
    setErr(null);
  }, [channel]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setBool = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.checked }));

  const save = async () => {
    setBusy(true);
    setErr(null);
    try {
      const payload = toPayload(form);
      const result = channel
        ? await coreFetch(session, `/channels/${channel.id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
          })
        : await coreFetch(session, '/channels', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
      onSaved(result);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!channel) return;
    if (!window.confirm(`Apagar canal @${channel.handle}? Fila e posts ficam órfãos.`)) return;
    setBusy(true);
    try {
      await coreFetch(session, `/channels/${channel.id}`, { method: 'DELETE' });
      onDeleted(channel.id);
    } catch (e) {
      setErr(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="section">
      <div className="section-title">{channel ? `Editar @${channel.handle}` : 'Novo canal'}</div>
      <div className="ig-form-grid">
        <label className="ig-field">
          Handle (sem @)
          <input value={form.handle} onChange={set('handle')} placeholder="meucanal" />
        </label>
        <label className="ig-field">
          Display name
          <input value={form.displayName} onChange={set('displayName')} placeholder="Meu Canal" />
        </label>
        <label className="ig-field">
          Nicho
          <input value={form.niche} onChange={set('niche')} placeholder="finanças, dev, devocional..." />
        </label>
        <label className="ig-field">
          Slides por carrossel (3-10)
          <input
            type="number"
            min="3"
            max="10"
            value={form.slidesPerCarousel}
            onChange={set('slidesPerCarousel')}
          />
        </label>
        <label className="ig-field full">
          Briefing do canal (visão geral, público, regras)
          <textarea value={form.brief} onChange={set('brief')} />
        </label>
        <label className="ig-field full">
          Tom de voz
          <textarea value={form.tone} onChange={set('tone')} placeholder="ex: direto, sem clichê, voz de amigo" />
        </label>
        <label className="ig-field full">
          Estilo da legenda
          <textarea
            value={form.captionStyle}
            onChange={set('captionStyle')}
            placeholder="ex: PT-BR, frases curtas, CTA suave"
          />
        </label>
        <label className="ig-field full" style={{ alignSelf: 'end' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={!!form.active} onChange={setBool('active')} />
            Canal ativo
          </span>
        </label>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 12 }}>
        Estilo visual, paleta e hashtags são decididos pela IA por post, com base no tema, nicho e tom de voz.
      </p>
      {err && <p style={{ color: 'var(--red)', fontSize: '0.82rem', marginTop: 12 }}>{err}</p>}
      <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
        <button className="btn-sm" disabled={busy} onClick={save}>
          {busy ? 'Salvando...' : channel ? 'Salvar alterações' : 'Criar canal'}
        </button>
        {onCancel && (
          <button className="btn-sm" onClick={onCancel}>Cancelar</button>
        )}
        {channel && (
          <button className="btn-sm" disabled={busy} onClick={remove} style={{ marginLeft: 'auto', color: 'var(--red)' }}>
            🗑 Apagar canal
          </button>
        )}
      </div>
    </div>
  );
}

function AddQueueForm({ session, channelId, onAdded }) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [brief, setBrief] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async () => {
    if (!topic.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      await coreFetch(session, `/channels/${channelId}/queue`, {
        method: 'POST',
        body: JSON.stringify({ topic: topic.trim(), brief: brief.trim() }),
      });
      setTopic('');
      setBrief('');
      setOpen(false);
      onAdded();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button className="btn-sm" onClick={() => setOpen(true)} style={{ marginBottom: 12 }}>
        + Adicionar tema na fila
      </button>
    );
  }
  return (
    <div className="section" style={{ marginBottom: 12 }}>
      <div className="section-title">Novo tema</div>
      <div className="ig-form-grid">
        <label className="ig-field full">
          Tema
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex.: 5 hábitos que destroem sua produtividade"
          />
        </label>
        <label className="ig-field full">
          Briefing (opcional)
          <textarea value={brief} onChange={(e) => setBrief(e.target.value)} />
        </label>
      </div>
      {err && <p style={{ color: 'var(--red)', fontSize: '0.82rem', marginTop: 8 }}>{err}</p>}
      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
        <button className="btn-sm" disabled={busy || !topic.trim()} onClick={submit}>
          {busy ? 'Adicionando...' : 'Adicionar'}
        </button>
        <button className="btn-sm" onClick={() => setOpen(false)}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function fmtDuration(ms) {
  if (ms == null) return '—';
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(ms < 10000 ? 2 : 1)} s`;
}

const STEP_LABELS = {
  plan: 'Plano (Claude)',
  slide: 'Slide',
  save: 'Persistir',
};

function RunLog({ item }) {
  const log = item.runLog ?? [];
  if (!log.length) {
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
          Execução · total <strong>{fmtDuration(item.runDurationMs)}</strong>
        </span>
        {item.generationStartedAt && (
          <span style={{ color: 'var(--muted)' }}>
            início {new Date(item.generationStartedAt).toLocaleTimeString('pt-BR')}
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
      </ol>
    </div>
  );
}

function QueueTable({ session, channelId, onPostGenerated }) {
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(null);
  const [err, setErr] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const { data, loading, refresh } = useCoreData(session, `/channels/${channelId}/queue`, [
    session,
    channelId,
  ]);

  const items = data?.items ?? [];
  const filtered = filter === 'all' ? items : items.filter((i) => i.status === filter);

  const patch = async (itemId, body) => {
    setBusy(itemId);
    setErr(null);
    try {
      await coreFetch(session, `/channels/${channelId}/queue/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      await refresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async (itemId) => {
    if (!window.confirm('Remover esse tema da fila?')) return;
    setBusy(itemId);
    setErr(null);
    try {
      await coreFetch(session, `/channels/${channelId}/queue/${itemId}`, { method: 'DELETE' });
      await refresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(null);
    }
  };

  const runNow = async (itemId) => {
    setBusy(itemId);
    setErr(null);
    try {
      await coreFetch(session, `/channels/${channelId}/queue/${itemId}/run`, { method: 'POST' });
      await refresh();
      onPostGenerated?.();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(null);
    }
  };

  const editItem = async (item) => {
    const topic = window.prompt('Tema:', item.topic);
    if (topic === null) return;
    const brief = window.prompt('Briefing:', item.brief ?? '');
    if (brief === null) return;
    await patch(item.id, { topic, brief });
  };

  return (
    <div className="section">
      <div className="section-title">
        Fila de temas <span className="badge">{items.length} temas</span>
      </div>
      <AddQueueForm session={session} channelId={channelId} onAdded={refresh} />
      <div className="tabs">
        {QUEUE_STATUSES.map((t) => (
          <button key={t} className={`tab ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
            {t === 'all' ? 'Todos' : t} (
            {t === 'all' ? items.length : items.filter((i) => i.status === t).length})
          </button>
        ))}
      </div>
      {err && <p style={{ color: 'var(--red)', fontSize: '0.82rem', marginBottom: 8 }}>{err}</p>}
      {loading && <p style={{ color: 'var(--muted)' }}>Carregando...</p>}
      {!loading && !items.length && (
        <div className="ig-empty">Fila vazia. Adicione um tema acima.</div>
      )}
      {!!filtered.length && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ordem</th>
                <th>Tema</th>
                <th>Status</th>
                <th>Atualizado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const isOpen = expanded === item.id;
                const hasLog = (item.runLog ?? []).length > 0;
                return (
                  <Fragment key={item.id}>
                    <tr>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {item.priority}{' '}
                        <button className="btn-sm" disabled={busy === item.id} onClick={() => patch(item.id, { action: 'up' })}>
                          ▲
                        </button>
                        <button className="btn-sm" disabled={busy === item.id} onClick={() => patch(item.id, { action: 'down' })}>
                          ▼
                        </button>
                      </td>
                      <td>
                        <strong>{item.topic}</strong>
                        {item.brief && (
                          <>
                            <br />
                            <span style={{ color: 'var(--muted)', fontSize: '0.74rem' }}>{item.brief}</span>
                          </>
                        )}
                        {item.error && (
                          <>
                            <br />
                            <span style={{ color: 'var(--red)', fontSize: '0.72rem' }}>{item.error}</span>
                          </>
                        )}
                      </td>
                      <td>
                        <span className={`status ${item.status}`}>{item.status}</span>
                        {item.runDurationMs > 0 && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 2 }}>
                            {fmtDuration(item.runDurationMs)}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                        {new Date(item.updatedAt).toLocaleString('pt-BR')}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button
                          className="btn-sm"
                          disabled={busy === item.id || item.status === 'generating'}
                          onClick={() => runNow(item.id)}
                          title="Gerar agora (síncrono)"
                        >
                          ▶ Gerar
                        </button>
                        {item.status === 'skip' ? (
                          <button className="btn-sm" disabled={busy === item.id} onClick={() => patch(item.id, { action: 'reactivate' })}>
                            Reativar
                          </button>
                        ) : item.status === 'error' ? (
                          <button className="btn-sm" disabled={busy === item.id} onClick={() => patch(item.id, { action: 'reactivate' })}>
                            Retry
                          </button>
                        ) : (
                          <button className="btn-sm" disabled={busy === item.id} onClick={() => patch(item.id, { action: 'skip' })}>
                            Pular
                          </button>
                        )}
                        <button
                          className={`btn-sm ${isOpen ? 'active' : ''}`}
                          onClick={() => setExpanded(isOpen ? null : item.id)}
                          title="Ver log de execução"
                          disabled={!hasLog}
                        >
                          ⓘ Log
                        </button>
                        <button className="btn-sm" disabled={busy === item.id} onClick={() => editItem(item)} title="Editar">
                          ✎
                        </button>
                        <button className="btn-sm" disabled={busy === item.id} onClick={() => remove(item.id)} title="Remover">
                          🗑
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="ig-log-row">
                        <td colSpan={5}>
                          <RunLog item={item} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function copyToClipboard(text) {
  if (navigator?.clipboard) navigator.clipboard.writeText(text);
}

function PostDetailRow({ session, postId }) {
  const [open, setOpen] = useState(false);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (post) return;
    setLoading(true);
    try {
      const data = await coreFetch(session, `/posts/${postId}`);
      setPost(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const toggle = async () => {
    if (!open) await load();
    setOpen((v) => !v);
  };

  return (
    <>
      <button className="btn-sm" onClick={toggle}>
        {open ? 'Ocultar' : 'Ver assets'}
      </button>
      {open && (
        <div style={{ marginTop: 10, gridColumn: '1 / -1' }}>
          {loading && <p style={{ color: 'var(--muted)' }}>Carregando...</p>}
          {post && (
            <>
              <div className="ig-asset-grid">
                {post.slides.map((s) => (
                  <div className="ig-asset" key={s.index}>
                    <img src={s.imageUrl} alt={`slide ${s.index + 1}`} />
                    <div className="lbl">
                      <strong>#{s.index + 1}</strong> · {s.role}
                    </div>
                    {s.text && (
                      <div className="lbl" title="Texto renderizado dentro da imagem">
                        “{s.text}”
                      </div>
                    )}
                    <a href={s.imageUrl} target="_blank" rel="noreferrer">
                      abrir asset
                    </a>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                {post.designConcept && (
                  <div>
                    <strong style={{ fontSize: '0.82rem' }}>Conceito visual</strong>
                    <div className="ig-caption-box">{post.designConcept}</div>
                  </div>
                )}
                {post.visualStyle && (
                  <div>
                    <strong style={{ fontSize: '0.82rem' }}>Direção visual (prompt)</strong>
                    <div className="ig-caption-box">{post.visualStyle}</div>
                  </div>
                )}
                <div>
                  <strong style={{ fontSize: '0.82rem' }}>Legenda</strong>
                  <button className="btn-sm" style={{ marginLeft: 8 }} onClick={() => copyToClipboard(post.caption)}>
                    Copiar
                  </button>
                  <div className="ig-caption-box">{post.caption}</div>
                </div>
                {post.hashtagTiers && (
                  <div style={{ display: 'grid', gap: 6 }}>
                    <strong style={{ fontSize: '0.82rem' }}>
                      Hashtags por tier
                      <button
                        className="btn-sm"
                        style={{ marginLeft: 8 }}
                        onClick={() => copyToClipboard((post.hashtags || []).join(' '))}
                      >
                        Copiar tudo
                      </button>
                    </strong>
                    {['high', 'medium', 'low'].map((tier) => {
                      const tags = post.hashtagTiers?.[tier] ?? [];
                      if (!tags.length) return null;
                      const label = tier === 'high' ? 'Alto volume' : tier === 'medium' ? 'Médio' : 'Long-tail';
                      return (
                        <div key={tier}>
                          <span style={{ color: 'var(--muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {label}
                          </span>
                          <button
                            className="btn-sm"
                            style={{ marginLeft: 8 }}
                            onClick={() => copyToClipboard(tags.join(' '))}
                          >
                            Copiar
                          </button>
                          <div className="ig-caption-box">{tags.join(' ')}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

function PostsTable({ session, channelId, refreshKey }) {
  const { data, loading, refresh } = useCoreData(session, `/channels/${channelId}/posts`, [
    session,
    channelId,
    refreshKey,
  ]);
  const items = data?.items ?? [];

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return (
    <div className="section">
      <div className="section-title">
        Posts gerados <span className="badge">{items.length}</span>
      </div>
      {loading && <p style={{ color: 'var(--muted)' }}>Carregando...</p>}
      {!loading && !items.length && <div className="ig-empty">Nenhum post gerado ainda.</div>}
      {!!items.length && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tema</th>
                <th>Slides</th>
                <th>Capa</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.topic}</strong>
                    <br />
                    <span style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>id: {p.id}</span>
                  </td>
                  <td>{p.slideCount}</td>
                  <td>
                    {p.coverImageUrl ? (
                      <a href={p.coverImageUrl} target="_blank" rel="noreferrer">
                        link
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                    {new Date(p.createdAt).toLocaleString('pt-BR')}
                  </td>
                  <td>
                    <PostDetailRow session={session} postId={p.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ChannelDetail({ session, channel, onChannelUpdated, onChannelDeleted }) {
  const [editing, setEditing] = useState(false);
  const [postsKey, setPostsKey] = useState(0);

  return (
    <div>
      {editing ? (
        <ChannelForm
          session={session}
          channel={channel}
          onSaved={(c) => {
            setEditing(false);
            onChannelUpdated(c);
          }}
          onCancel={() => setEditing(false)}
          onDeleted={(id) => {
            setEditing(false);
            onChannelDeleted(id);
          }}
        />
      ) : (
        <div className="section">
          <div className="section-title">
            @{channel.handle} · {channel.displayName}
            <span className="badge">{channel.slidesPerCarousel} slides</span>
            {!channel.active && <span className="badge" style={{ color: 'var(--red)' }}>inativo</span>}
            <button className="btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setEditing(true)}>
              ✎ Editar canal
            </button>
          </div>
          {channel.brief && <p style={{ color: 'var(--muted)', fontSize: '0.84rem' }}>{channel.brief}</p>}
        </div>
      )}

      <QueueTable
        session={session}
        channelId={channel.id}
        onPostGenerated={() => setPostsKey((k) => k + 1)}
      />

      <PostsTable session={session} channelId={channel.id} refreshKey={postsKey} />
    </div>
  );
}

export default function InstagramPanel({ session }) {
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const { data, loading, error, refresh, setData } = useCoreData(session, '/channels', [session]);

  const channels = useMemo(() => data?.items ?? [], [data]);
  const selected = channels.find((c) => c.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected && channels.length > 0 && !creating) {
      setSelectedId(channels[0].id);
    }
  }, [channels, selected, creating]);

  const upsertLocal = (channel) => {
    setData((prev) => {
      const items = prev?.items ?? [];
      const idx = items.findIndex((c) => c.id === channel.id);
      const next = idx >= 0 ? items.map((c) => (c.id === channel.id ? channel : c)) : [channel, ...items];
      return { ...(prev ?? {}), items: next };
    });
    setSelectedId(channel.id);
    setCreating(false);
  };

  const removeLocal = (id) => {
    setData((prev) => ({ ...(prev ?? {}), items: (prev?.items ?? []).filter((c) => c.id !== id) }));
    setSelectedId(null);
  };

  if (!session?.coreApiToken) {
    return (
      <div className="ig-empty">
        Não consegui autenticar na API principal. Verifique as variáveis{' '}
        <code>NEXT_PUBLIC_CORE_API_URL</code>, <code>CORE_API_USERNAME</code> e{' '}
        <code>CORE_API_PASSWORD</code> no admin.
      </div>
    );
  }

  return (
    <div className="ig-layout">
      <aside className="ig-sidebar">
        <h3>Canais</h3>
        <button
          className="btn-sm"
          style={{ width: '100%', marginBottom: 10 }}
          onClick={() => {
            setCreating(true);
            setSelectedId(null);
          }}
        >
          + Novo canal
        </button>
        {loading && <p style={{ color: 'var(--muted)', padding: '0 6px' }}>Carregando...</p>}
        {error && <p style={{ color: 'var(--red)', padding: '0 6px', fontSize: '0.78rem' }}>{error}</p>}
        {channels.map((c) => (
          <div
            key={c.id}
            className={`ig-channel-row ${c.id === selectedId ? 'active' : ''}`}
            onClick={() => {
              setSelectedId(c.id);
              setCreating(false);
            }}
          >
            <span className="handle">@{c.handle}</span>
            <span className="display">{c.displayName}</span>
          </div>
        ))}
        {!loading && !channels.length && !creating && (
          <p style={{ color: 'var(--muted)', padding: '8px 6px', fontSize: '0.8rem' }}>
            Nenhum canal ainda. Crie o primeiro.
          </p>
        )}
      </aside>

      <main>
        {creating && (
          <ChannelForm
            session={session}
            channel={null}
            onSaved={(c) => {
              upsertLocal(c);
              refresh();
            }}
            onCancel={() => setCreating(false)}
            onDeleted={() => {}}
          />
        )}
        {!creating && selected && (
          <ChannelDetail
            session={session}
            channel={selected}
            onChannelUpdated={upsertLocal}
            onChannelDeleted={removeLocal}
          />
        )}
        {!creating && !selected && !loading && (
          <div className="ig-empty">Selecione um canal à esquerda ou crie um novo.</div>
        )}
      </main>
    </div>
  );
}
