'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { SocialPostDto } from '@fernandolimaindie/shared';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { ExternalLink, CheckCircle, Trash2, RefreshCw, Loader2 } from 'lucide-react';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'success' | 'warn' | 'error'> = {
  pending_review: 'warn',
  published: 'success',
  failed: 'error',
  generating: 'secondary',
};

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<SocialPostDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => { void load(); }, [id]);

  async function retry() {
    setRetrying(true);
    try {
      await api(`/api/v1/social/posts/${id}/retry`, { method: 'POST' });
      toast.success('Retry started — images reused, posting again');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Retry failed');
    } finally {
      setRetrying(false);
    }
  }

  async function load() {
    try {
      const data = await api<SocialPostDto>(`/api/v1/social/posts/${id}`);
      setPost(data);
    } catch {
      toast.error('Post not found');
      router.replace('/posts');
    } finally {
      setLoading(false);
    }
  }

  async function markPublished() {
    try {
      await api(`/api/v1/social/posts/${id}/status`, { method: 'PATCH', body: { status: 'published' } });
      toast.success('Marked as published');
      void load();
    } catch { toast.error('Failed to update status'); }
  }

  async function remove() {
    if (!confirm('Delete this post?')) return;
    try {
      await api(`/api/v1/social/posts/${id}`, { method: 'DELETE' });
      toast.success('Post deleted');
      router.replace('/posts');
    } catch { toast.error('Failed to delete post'); }
  }

  if (loading) return <p className="text-[var(--color-muted)] text-sm">Loading…</p>;
  if (!post) return null;

  return (
    <>
      <PageHeader
        title={post.topic}
        description={`${post.images.length} slides · ${post.platform.toUpperCase()}`}
        actions={
          <div className="flex gap-2">
            <Badge variant={STATUS_VARIANT[post.status] ?? 'secondary'}>{post.status}</Badge>
            {post.platformShareUrl && (
              <Button asChild variant="outline" size="sm">
                <a href={post.platformShareUrl} target="_blank" rel="noopener">
                  <ExternalLink className="h-4 w-4" /> Open on TikTok
                </a>
              </Button>
            )}
            {post.status === 'pending_review' && (
              <Button size="sm" onClick={markPublished}>
                <CheckCircle className="h-4 w-4" /> Mark as published
              </Button>
            )}
            {post.status === 'failed' && (
              <Button
                size="sm"
                onClick={retry}
                disabled={retrying}
                title="Reuses topic, caption, hashtags and images — only retries posting to TikTok"
              >
                {retrying ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Retrying…</>
                ) : (
                  <><RefreshCw className="h-4 w-4" /> Retry post</>
                )}
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={remove}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Carousel ({post.images.length} slides)</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {post.images.map((img, i) => (
                  <div key={i} className="shrink-0">
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="h-64 w-48 rounded-lg object-cover"
                    />
                    <p className="text-xs text-[var(--color-muted)] mt-1 w-48 truncate">
                      Slide {i + 1}: {img.alt}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Caption</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.caption}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Hashtags</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {post.hashtags.map((h, i) => (
                  <span key={i} className="text-xs bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-full px-2 py-0.5">
                    #{h}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">Platform</span>
                <span className="font-medium uppercase">{post.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">Status</span>
                <Badge variant={STATUS_VARIANT[post.status] ?? 'secondary'}>{post.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">Created</span>
                <span>{new Date(post.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
              {post.notificationSentAt && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Email sent</span>
                  <span>{new Date(post.notificationSentAt).toLocaleString('en-US', { timeStyle: 'short' })}</span>
                </div>
              )}
              {post.platformPostId && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">TikTok ID</span>
                  <code className="text-xs">{post.platformPostId.slice(0, 16)}…</code>
                </div>
              )}
              {post.failureReason && (
                <div className="rounded-md bg-red-50 dark:bg-red-950/30 px-3 py-2 text-xs text-red-700 dark:text-red-300">
                  {post.failureReason}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
