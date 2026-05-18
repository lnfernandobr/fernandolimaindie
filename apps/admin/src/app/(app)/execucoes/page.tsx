'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ChannelDto, RunDto } from '@fernandolimaindie/shared';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function RunsPage() {
  const [items, setItems] = useState<RunDto[]>([]);
  const [channels, setChannels] = useState<Record<string, ChannelDto>>({});
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [r, c] = await Promise.all([
        api<{ items: RunDto[] }>('/api/v1/runs', { query: { limit: 50 } }),
        api<{ items: ChannelDto[] }>('/api/v1/channels', { query: { limit: 100 } }),
      ]);
      setItems(r.items);
      setChannels(Object.fromEntries(c.items.map((c) => [c.id, c])));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <>
      <PageHeader
        title="Execuções"
        description="Cada execução do pipeline (cron ou manual) e suas etapas."
        actions={
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar
          </Button>
        }
      />

      <div className="space-y-4">
        {items.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-[var(--color-muted)]">Nenhuma execução ainda.</CardContent></Card>
        ) : (
          items.map((r) => (
            <Card key={r.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base">
                    {channels[r.channelId]?.name ?? r.channelId}
                    <span className="ml-2 text-xs text-[var(--color-muted)] font-normal">
                      {r.trigger === 'cron' ? `cron · ${r.cronExpression ?? ''}` : 'manual'}
                    </span>
                  </CardTitle>
                  <div className="text-xs text-[var(--color-muted)] mt-1">
                    {new Date(r.startedAt).toLocaleString('pt-BR')}
                    {typeof r.durationMs === 'number' ? ` · ${(r.durationMs / 1000).toFixed(2)}s` : ''}
                  </div>
                </div>
                <Badge
                  variant={
                    r.status === 'success'
                      ? 'success'
                      : r.status === 'error'
                        ? 'error'
                        : r.status === 'running'
                          ? 'default'
                          : r.status === 'partial'
                            ? 'warn'
                            : 'secondary'
                  }
                >
                  {r.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {r.steps.map((s, i) => (
                    <li key={i} className="text-sm flex items-center gap-3">
                      <Badge
                        variant={
                          s.status === 'success'
                            ? 'success'
                            : s.status === 'error'
                              ? 'error'
                              : s.status === 'running'
                                ? 'default'
                                : 'secondary'
                        }
                      >
                        {s.status}
                      </Badge>
                      <span className="font-mono text-xs">{s.name}</span>
                      {typeof s.durationMs === 'number' ? (
                        <span className="text-xs text-[var(--color-muted)]">
                          {(s.durationMs / 1000).toFixed(2)}s
                        </span>
                      ) : null}
                      {s.message ? (
                        <span className="text-xs text-red-600 ml-auto truncate max-w-md">{s.message}</span>
                      ) : null}
                    </li>
                  ))}
                </ol>
                {r.error ? <p className="text-xs text-red-600 mt-3">{r.error}</p> : null}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
