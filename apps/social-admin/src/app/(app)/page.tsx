'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { SocialCampaignDto, SocialPostDto, SocialRunDto } from '@fernandolimaindie/shared';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { Megaphone, ImageIcon, Activity, Play, Loader2, ExternalLink } from 'lucide-react';

interface Paginated<T> {
  items: T[];
  total: number;
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'success' | 'warn' | 'error'> = {
  pending_review: 'warn',
  published: 'success',
  failed: 'error',
  generating: 'secondary',
  success: 'success',
  error: 'error',
  partial: 'warn',
  running: 'default',
  queued: 'secondary',
};

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<SocialCampaignDto[]>([]);
  const [posts, setPosts] = useState<SocialPostDto[]>([]);
  const [runs, setRuns] = useState<SocialRunDto[]>([]);
  const [running, setRunning] = useState<Set<string>>(new Set());

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    try {
      const [c, p, r] = await Promise.all([
        api<Paginated<SocialCampaignDto>>('/api/v1/social/campaigns'),
        api<Paginated<SocialPostDto>>('/api/v1/social/posts', { query: { limit: 8 } }),
        api<Paginated<SocialRunDto>>('/api/v1/social/runs', { query: { limit: 8 } }),
      ]);
      setCampaigns(c.items);
      setPosts(p.items);
      setRuns(r.items);
    } catch {
      toast.error('Failed to load dashboard');
    }
  }

  async function trigger(campaignId: string) {
    if (running.has(campaignId)) return;
    setRunning((s) => new Set(s).add(campaignId));
    try {
      await api(`/api/v1/social/campaigns/${campaignId}/trigger`, { method: 'POST' });
      toast.success('Pipeline started — check Runs for progress');
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to trigger');
    } finally {
      setRunning((s) => {
        const next = new Set(s);
        next.delete(campaignId);
        return next;
      });
    }
  }

  const pendingPosts = posts.filter((p) => p.status === 'pending_review');

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your TikTok automation campaigns, posts awaiting review, and recent pipeline runs."
      />

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-[var(--color-muted)]">Active campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-[var(--color-muted)]" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-semibold">{campaigns.filter((c) => c.active).length}</div>
            <div className="text-xs text-[var(--color-muted)]">of {campaigns.length} total</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-[var(--color-muted)]">Awaiting review</CardTitle>
            <ImageIcon className="h-4 w-4 text-[var(--color-muted)]" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-semibold">{pendingPosts.length}</div>
            <div className="text-xs text-[var(--color-muted)]">posts in TikTok drafts</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-[var(--color-muted)]">Recent runs</CardTitle>
            <Activity className="h-4 w-4 text-[var(--color-muted)]" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-semibold">{runs.length}</div>
            <div className="text-xs text-[var(--color-muted)]">last 8</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaigns.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">
                No campaigns yet.{' '}
                <Link href="/campaigns/new" className="text-[var(--color-accent)] hover:underline">
                  Create one
                </Link>
              </p>
            ) : (
              campaigns.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 border-b last:border-0 pb-4 last:pb-0">
                  <div>
                    <Link href={`/campaigns/${c.id}` as any} className="font-medium hover:underline text-sm">
                      {c.name}
                    </Link>
                    <div className="text-xs text-[var(--color-muted)]">
                      {c.niche} · {c.imageCount} slides · {c.publishTimes.join(', ')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={c.active ? 'success' : 'secondary'}>
                      {c.active ? 'active' : 'paused'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => trigger(c.id)}
                      disabled={running.has(c.id)}
                    >
                      {running.has(c.id) ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Posts awaiting review</CardTitle>
              {pendingPosts.length > 0 && (
                <Link href="/posts?status=pending_review" className="text-xs text-[var(--color-accent)] hover:underline">
                  View all
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="divide-y">
            {pendingPosts.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)] py-2">No posts pending review.</p>
            ) : (
              pendingPosts.map((p) => (
                <div key={p.id} className="py-3 flex items-start gap-3">
                  {p.images[0] && (
                    <img
                      src={p.images[0].url}
                      alt={p.images[0].alt}
                      className="h-12 w-9 rounded object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <Link href={`/posts/${p.id}` as any} className="text-sm font-medium hover:underline line-clamp-1">
                      {p.topic}
                    </Link>
                    <div className="text-xs text-[var(--color-muted)] mt-0.5">
                      {new Date(p.createdAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                      {' · '}
                      {p.images.length} slides
                    </div>
                  </div>
                  {p.platformShareUrl && (
                    <a href={p.platformShareUrl} target="_blank" rel="noopener" className="shrink-0">
                      <ExternalLink className="h-4 w-4 text-[var(--color-muted)] hover:text-[var(--color-accent)]" />
                    </a>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent runs</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {runs.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)] py-2">No runs yet.</p>
            ) : (
              runs.map((r) => (
                <div key={r.id} className="py-3 flex items-center gap-3">
                  <Badge variant={STATUS_VARIANT[r.status] ?? 'secondary'}>{r.status}</Badge>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">
                      {new Date(r.startedAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                    <div className="text-xs text-[var(--color-muted)]">
                      {r.trigger} · {r.durationMs ? `${(r.durationMs / 1000).toFixed(1)}s` : 'running…'}
                    </div>
                  </div>
                  {r.error && (
                    <span className="text-xs text-red-500 truncate max-w-xs">{r.error}</span>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
