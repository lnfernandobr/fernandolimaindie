'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { SocialCampaignDto, SocialRunDto } from '@fernandolimaindie/shared';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import { Plus, Play, Pencil, Loader2 } from 'lucide-react';

interface Paginated<T> { items: T[]; total: number }

export default function CampaignsPage() {
  const [items, setItems] = useState<SocialCampaignDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<Set<string>>(new Set());

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await api<Paginated<SocialCampaignDto>>('/api/v1/social/campaigns');
      setItems(data.items);
    } catch { toast.error('Failed to load campaigns'); }
    finally { setLoading(false); }
  }

  async function trigger(id: string) {
    if (running.has(id)) return;
    setRunning((s) => new Set(s).add(id));
    try {
      await api<SocialRunDto>(`/api/v1/social/campaigns/${id}/trigger`, { method: 'POST' });
      toast.success('Pipeline triggered');
    } catch { toast.error('Failed to trigger'); }
    finally {
      setRunning((s) => { const n = new Set(s); n.delete(id); return n; });
    }
  }

  return (
    <>
      <PageHeader
        title="Campaigns"
        description="Each campaign generates TikTok carousels automatically on a schedule."
        actions={
          <Button asChild>
            <Link href="/campaigns/new"><Plus className="h-4 w-4" /> New campaign</Link>
          </Button>
        }
      />
      <div className="rounded-lg border bg-[var(--color-card)]">
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Niche</TH>
              <TH>Slides</TH>
              <TH>Schedule</TH>
              <TH>Status</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {loading ? (
              <TR><TD colSpan={6} className="text-center text-[var(--color-muted)]">Loading…</TD></TR>
            ) : items.length === 0 ? (
              <TR><TD colSpan={6} className="text-center text-[var(--color-muted)]">No campaigns. Create one to get started.</TD></TR>
            ) : (
              items.map((c) => (
                <TR key={c.id}>
                  <TD className="font-medium">
                    <Link className="hover:underline" href={`/campaigns/${c.id}` as any}>{c.name}</Link>
                  </TD>
                  <TD className="text-[var(--color-muted)] text-sm">{c.niche}</TD>
                  <TD>{c.imageCount}</TD>
                  <TD className="text-xs text-[var(--color-muted)]">{c.publishTimes.join(', ')}</TD>
                  <TD>
                    <Badge variant={c.active ? 'success' : 'secondary'}>{c.active ? 'active' : 'paused'}</Badge>
                  </TD>
                  <TD className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/campaigns/${c.id}` as any}><Pencil className="h-3 w-3" /> Edit</Link>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => trigger(c.id)} disabled={running.has(c.id)}>
                        {running.has(c.id)
                          ? <><Loader2 className="h-3 w-3 animate-spin" /> Running…</>
                          : <><Play className="h-3 w-3" /> Run</>}
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
