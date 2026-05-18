'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { ChannelDto } from '@fernandolimaindie/shared';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import { ExternalLink } from 'lucide-react';

export default function OverviewIndexPage() {
  const [channels, setChannels] = useState<ChannelDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const data = await api<{ items: ChannelDto[] }>('/api/v1/channels', { query: { limit: 100 } });
        setChannels(data.items);
      } catch {
        toast.error('Falha ao carregar canais');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <PageHeader
        title="Overview"
        description="Saúde dos sites: performance, SEO, GEO e descoberta. Selecione um canal para ver o relatório completo."
      />
      {loading ? (
        <p className="text-sm text-[var(--color-muted)]">Carregando…</p>
      ) : channels.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-[var(--color-muted)]">
            Nenhum canal cadastrado.{' '}
            <Link href="/canais/novo" className="underline">Criar o primeiro</Link>.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {channels.map((c) => {
            const a = c.lastAudit;
            return (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <Link href={`/overview/${c.id}` as any} className="hover:underline">
                      {c.name}
                    </Link>
                    <Badge variant={c.active ? 'success' : 'secondary'}>
                      {c.active ? 'ativo' : 'inativo'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a
                    href={c.siteUrl}
                    target="_blank"
                    rel="noopener"
                    className="text-xs text-[var(--color-accent)] hover:underline inline-flex items-center gap-1"
                  >
                    {c.siteUrl.replace(/^https?:\/\//, '')}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  {a ? (
                    <div className="grid grid-cols-4 gap-2 text-center pt-1">
                      <ScoreMini label="Perf" score={a.pagespeed?.mobile?.scores.performance ?? null} />
                      <ScoreMini label="A11y" score={a.pagespeed?.mobile?.scores.accessibility ?? null} />
                      <ScoreMini label="SEO" score={a.pagespeed?.mobile?.scores.seo ?? null} />
                      <ScoreMini label="GEO" score={a.geo.score} />
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--color-muted)]">
                      Ainda não auditado.{' '}
                      <Link href={`/overview/${c.id}` as any} className="underline">
                        Rodar agora
                      </Link>
                    </p>
                  )}
                  <Link
                    href={`/overview/${c.id}` as any}
                    className="block text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)] pt-1 border-t"
                  >
                    Ver relatório completo →
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

function ScoreMini({ label, score }: { label: string; score: number | null }) {
  const display = score === null ? '—' : score;
  const color =
    score === null
      ? 'text-[var(--color-muted)]'
      : score >= 90
        ? 'text-green-600'
        : score >= 50
          ? 'text-yellow-600'
          : 'text-red-600';
  return (
    <div>
      <div className={`text-2xl font-semibold ${color}`}>{display}</div>
      <div className="text-[10px] uppercase tracking-widest text-[var(--color-muted)]">{label}</div>
    </div>
  );
}
