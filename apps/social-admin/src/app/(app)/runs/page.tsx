'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { SocialRunDto } from '@bn/shared';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { CheckCircle, XCircle, AlertCircle, Clock, Loader2, RefreshCw } from 'lucide-react';

interface Paginated<T> { items: T[]; total: number }

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'success' | 'warn' | 'error'> = {
  success: 'success',
  error: 'error',
  partial: 'warn',
  running: 'default',
  queued: 'secondary',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  success: <CheckCircle className="h-4 w-4 text-green-500" />,
  error: <XCircle className="h-4 w-4 text-red-500" />,
  partial: <AlertCircle className="h-4 w-4 text-yellow-500" />,
  running: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
  queued: <Clock className="h-4 w-4 text-gray-400" />,
};

export default function RunsPage() {
  const [items, setItems] = useState<SocialRunDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await api<Paginated<SocialRunDto>>('/api/v1/social/runs', { query: { limit: 50 } });
      setItems(data.items);
    } catch { toast.error('Failed to load runs'); }
    finally { setLoading(false); }
  }

  async function retry(postId: string) {
    setRetrying(postId);
    try {
      await api(`/api/v1/social/posts/${postId}/retry`, { method: 'POST' });
      toast.success('Retry started — images reused, posting again');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Retry failed');
    } finally {
      setRetrying(null);
    }
  }

  if (loading) return <p className="text-sm text-[var(--color-muted)]">Loading…</p>;

  return (
    <>
      <PageHeader title="Runs" description="Pipeline execution history for all campaigns." />
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">No runs yet.</p>
        ) : (
          items.map((run) => {
            const canRetry =
              !!run.postId && (run.status === 'partial' || run.status === 'error');
            return (
              <Card key={run.id}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{STATUS_ICON[run.status] ?? <Clock className="h-4 w-4" />}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={STATUS_VARIANT[run.status] ?? 'secondary'}>{run.status}</Badge>
                        <span className="text-xs text-[var(--color-muted)]">
                          {run.trigger} · {new Date(run.startedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                          {run.durationMs && ` · ${(run.durationMs / 1000).toFixed(1)}s`}
                        </span>
                      </div>
                      {run.error && (
                        <p className="text-xs text-red-500 mt-1">{run.error}</p>
                      )}
                      <div className="mt-3 flex gap-1.5 flex-wrap">
                        {run.steps.map((step, i) => (
                          <div
                            key={i}
                            title={step.message ?? step.name}
                            className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs border ${
                              step.status === 'success'
                                ? 'border-green-200 text-green-700 dark:border-green-800 dark:text-green-400'
                                : step.status === 'error'
                                  ? 'border-red-200 text-red-700 dark:border-red-800 dark:text-red-400'
                                  : step.status === 'running'
                                    ? 'border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400'
                                    : 'border-[var(--color-border)] text-[var(--color-muted)]'
                            }`}
                          >
                            {step.name}
                            {step.durationMs && (
                              <span className="opacity-60">{(step.durationMs / 1000).toFixed(1)}s</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    {canRetry && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={retrying === run.postId}
                        onClick={() => retry(run.postId!)}
                        title="Reuses topic, caption, hashtags and images — only retries posting to TikTok"
                      >
                        {retrying === run.postId ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Retrying…
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3.5 w-3.5" /> Retry post
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </>
  );
}
