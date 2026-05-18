'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { PostDto } from '@fernandolimaindie/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';

export function ChannelPosts({ channelId }: { channelId: string }) {
  const [items, setItems] = useState<PostDto[] | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await api<{ items: PostDto[] }>('/api/v1/posts', {
          query: { channelId, limit: 20 },
        });
        setItems(data.items);
      } catch {
        setItems([]);
      }
    })();
  }, [channelId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimos posts gerados</CardTitle>
      </CardHeader>
      <CardContent>
        {items === null ? (
          <p className="text-sm text-[var(--color-muted)]">Carregando…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            Nenhum post ainda. Use “Gerar post agora” acima ou aguarde o próximo horário agendado.
          </p>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Título</TH>
                <TH>Slug</TH>
                <TH>Status</TH>
                <TH>Publicado em</TH>
              </TR>
            </THead>
            <TBody>
              {items.map((p) => (
                <TR key={p.id}>
                  <TD className="font-medium max-w-md">
                    <span className="line-clamp-1">{p.title}</span>
                  </TD>
                  <TD>
                    <code className="text-xs">{p.slug}</code>
                  </TD>
                  <TD>
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
                  </TD>
                  <TD className="text-xs text-[var(--color-muted)]">
                    {p.publishedAt ? new Date(p.publishedAt).toLocaleString('pt-BR') : '—'}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
