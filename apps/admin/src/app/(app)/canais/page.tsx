'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { postsPlanTotal, type ChannelDto } from '@bn/shared';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import { Plus, Play, Pencil } from 'lucide-react';

interface Paginated<T> { items: T[]; total: number }

export default function ChannelsListPage() {
  const [items, setItems] = useState<ChannelDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await api<Paginated<ChannelDto>>('/api/v1/channels', { query: { limit: 50 } });
      setItems(data.items);
    } catch {
      toast.error('Falha ao carregar canais');
    } finally {
      setLoading(false);
    }
  }

  async function trigger(id: string) {
    try {
      await api(`/api/v1/runs/trigger/${id}`, { method: 'POST' });
      toast.success('Pipeline disparado');
    } catch {
      toast.error('Falha ao disparar pipeline');
    }
  }

  return (
    <>
      <PageHeader
        title="Canais"
        description="Cada canal representa um site externo (Next.js) que recebe os posts gerados pela API."
        actions={
          <Button asChild>
            <Link href="/canais/novo"><Plus className="h-4 w-4" /> Novo canal</Link>
          </Button>
        }
      />
      <div className="rounded-lg border bg-[var(--color-card)]">
        <Table>
          <THead>
            <TR>
              <TH>Nome</TH>
              <TH>Site</TH>
              <TH>Nicho</TH>
              <TH>Status</TH>
              <TH>Agenda</TH>
              <TH className="text-right">Ações</TH>
            </TR>
          </THead>
          <TBody>
            {loading ? (
              <TR><TD colSpan={6} className="text-center text-[var(--color-muted)]">Carregando…</TD></TR>
            ) : items.length === 0 ? (
              <TR><TD colSpan={6} className="text-center text-[var(--color-muted)]">Nenhum canal cadastrado.</TD></TR>
            ) : (
              items.map((c) => (
                <TR key={c.id}>
                  <TD className="font-medium">
                    <Link className="hover:underline" href={`/canais/${c.id}` as any}>{c.name}</Link>
                    <div className="text-xs text-[var(--color-muted)]">/{c.slug}</div>
                  </TD>
                  <TD>
                    <a
                      href={c.siteUrl}
                      target="_blank"
                      rel="noopener"
                      className="text-xs hover:underline text-[var(--color-accent)]"
                    >
                      {c.siteUrl.replace(/^https?:\/\//, '')}
                    </a>
                  </TD>
                  <TD>{c.niche}</TD>
                  <TD>
                    <Badge variant={c.active ? 'success' : 'secondary'}>{c.active ? 'ativo' : 'inativo'}</Badge>
                  </TD>
                  <TD>
                    <span className="text-xs text-[var(--color-muted)]">
                      {c.publishTimes.length > 0
                        ? `${c.publishTimes.join(', ')} · ${postsPlanTotal(c.postsPlan)}/slot`
                        : '—'}
                    </span>
                    {c.postsPlan.length > 0 ? (
                      <div className="text-xs text-[var(--color-muted)] mt-0.5">
                        {c.postsPlan
                          .map((b) => `${b.count}× até ${b.targetReadingMinutes}min`)
                          .join(' + ')}
                      </div>
                    ) : null}
                  </TD>
                  <TD className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/canais/${c.id}` as any} aria-label={`Editar ${c.name}`}>
                          <Pencil className="h-3 w-3" /> Editar
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => trigger(c.id)}>
                        <Play className="h-3 w-3" /> Disparar
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </div>
    </>
  );
}
