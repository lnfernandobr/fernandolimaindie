'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { postsPlanTotal, type ChannelDto, type PostDto, type RunDto } from '@fernandolimaindie/shared';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { Activity, FileText, Radio, Play, Loader2 } from 'lucide-react';

interface Paginated<T> { items: T[]; total: number; page: number; limit: number; totalPages: number }

export default function DashboardPage() {
  const [channels, setChannels] = useState<ChannelDto[]>([]);
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [runs, setRuns] = useState<RunDto[]>([]);
  const [nextRuns, setNextRuns] = useState<Record<string, { cron: string; next: string[] }[]>>({});
  const [running, setRunning] = useState<Set<string>>(new Set());

  useEffect(() => {
    void (async () => {
      try {
        const [c, p, r] = await Promise.all([
          api<Paginated<ChannelDto>>('/api/v1/channels', { query: { limit: 50 } }),
          api<Paginated<PostDto>>('/api/v1/posts', { query: { limit: 8 } }),
          api<Paginated<RunDto>>('/api/v1/runs', { query: { limit: 8 } }),
        ]);
        setChannels(c.items);
        setPosts(p.items);
        setRuns(r.items);
        const nrEntries = await Promise.all(
          c.items
            .filter((ch) => ch.active)
            .map(async (ch) => {
              try {
                const data = await api<{ items: { cron: string; next: string[] }[] }>(
                  `/api/v1/scheduler/channels/${ch.id}/next`,
                );
                return [ch.id, data.items] as const;
              } catch {
                return [ch.id, []] as const;
              }
            }),
        );
        setNextRuns(Object.fromEntries(nrEntries));
      } catch {
        toast.error('Falha ao carregar dashboard');
      }
    })();
  }, []);

  async function trigger(channelId: string) {
    if (running.has(channelId)) return;
    setRunning((s) => new Set(s).add(channelId));
    try {
      const run = await api<RunDto>(`/api/v1/runs/trigger/${channelId}`, { method: 'POST' });
      if (run.status === 'success') toast.success('Post gerado com sucesso');
      else if (run.status === 'partial') toast.success('Post gerado com avisos (ver Execuções)');
      else toast.error(run.error ?? 'Pipeline falhou');
      // Atualiza a lista de runs recentes pra refletir a nova execução.
      try {
        const r = await api<Paginated<RunDto>>('/api/v1/runs', { query: { limit: 8 } });
        setRuns(r.items);
      } catch {
        /* ignore */
      }
    } catch {
      toast.error('Falha ao disparar pipeline');
    } finally {
      setRunning((s) => {
        const next = new Set(s);
        next.delete(channelId);
        return next;
      });
    }
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral: canais ativos, próximas execuções e atividade recente. Conteúdo é gerado automaticamente."
      />
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-[var(--color-muted)]">Canais ativos</CardTitle>
            <Radio className="h-4 w-4 text-[var(--color-muted)]" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-semibold">{channels.filter((c) => c.active).length}</div>
            <div className="text-xs text-[var(--color-muted)]">de {channels.length} totais</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-[var(--color-muted)]">Posts gerados (recentes)</CardTitle>
            <FileText className="h-4 w-4 text-[var(--color-muted)]" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-semibold">{posts.length}</div>
            <div className="text-xs text-[var(--color-muted)]">últimos 8</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-[var(--color-muted)]">Execuções recentes</CardTitle>
            <Activity className="h-4 w-4 text-[var(--color-muted)]" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-semibold">{runs.length}</div>
            <div className="text-xs text-[var(--color-muted)]">últimas 8</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximas execuções agendadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {channels.filter((c) => c.active).length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">Nenhum canal ativo.</p>
            ) : (
              channels
                .filter((c) => c.active)
                .map((ch) => {
                  const slots = nextRuns[ch.id] ?? [];
                  return (
                    <div key={ch.id} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <Link href={`/canais/${ch.id}` as any} className="font-medium hover:underline">
                            {ch.name}
                          </Link>
                          <div className="text-xs text-[var(--color-muted)]">
                            /{ch.slug} · {ch.timezone} · {ch.publishTimes.length * postsPlanTotal(ch.postsPlan)}/dia
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => trigger(ch.id)}
                          disabled={running.has(ch.id)}
                        >
                          {running.has(ch.id) ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" /> Gerando…
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3" /> Disparar agora
                            </>
                          )}
                        </Button>
                      </div>
                      {slots.length === 0 ? (
                        <p className="text-xs text-[var(--color-muted)] mt-2">Nenhum slot de cron ativo.</p>
                      ) : (
                        <ul className="text-xs mt-2 space-y-1">
                          {slots.slice(0, 3).map((s, i) => (
                            <li key={`${ch.id}-${i}`} className="flex justify-between">
                              <code className="text-[var(--color-muted)]">{s.cron}</code>
                              <span>{s.next[0] ? new Date(s.next[0]).toLocaleString('pt-BR') : '—'}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Posts gerados recentemente</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {posts.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-sm font-medium line-clamp-1">{p.title}</span>
                  <div className="text-xs text-[var(--color-muted)]">
                    {new Date(p.publishedAt ?? p.createdAt).toLocaleString('pt-BR')}
                    {' · '}
                    <code>/{p.slug}</code>
                  </div>
                </div>
                <Badge
                  variant={
                    p.status === 'published'
                      ? 'success'
                      : p.status === 'draft'
                        ? 'secondary'
                        : 'default'
                  }
                >
                  {p.status}
                </Badge>
              </div>
            ))}
            {posts.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)] py-3">Nenhum post gerado ainda.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
