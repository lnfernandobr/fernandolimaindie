'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { SocialPostDto } from '@bn/shared';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import { ExternalLink } from 'lucide-react';

interface Paginated<T> { items: T[]; total: number; totalPages: number }

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'success' | 'warn' | 'error'> = {
  pending_review: 'warn',
  published: 'success',
  failed: 'error',
  generating: 'secondary',
};

const STATUS_LABELS: Record<string, string> = {
  pending_review: 'Pending review',
  published: 'Published',
  failed: 'Failed',
  generating: 'Generating',
};

export default function PostsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--color-muted)]">Loading…</p>}>
      <PostsContent />
    </Suspense>
  );
}

function PostsContent() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') ?? '';
  const [items, setItems] = useState<SocialPostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => { void load(); }, [statusFilter]);

  async function load() {
    setLoading(true);
    try {
      const data = await api<Paginated<SocialPostDto>>('/api/v1/social/posts', {
        query: { limit: 50, ...(statusFilter ? { status: statusFilter } : {}) },
      });
      setItems(data.items);
      setTotal(data.total);
    } catch { toast.error('Failed to load posts'); }
    finally { setLoading(false); }
  }

  return (
    <>
      <PageHeader
        title="Posts"
        description={`${total} total · ${statusFilter ? `Filtered: ${statusFilter}` : 'All statuses'}`}
      />
      <div className="rounded-lg border bg-[var(--color-card)]">
        <Table>
          <THead>
            <TR>
              <TH>Preview</TH>
              <TH>Topic</TH>
              <TH>Slides</TH>
              <TH>Status</TH>
              <TH>Created</TH>
              <TH></TH>
            </TR>
          </THead>
          <TBody>
            {loading ? (
              <TR><TD colSpan={6} className="text-center text-[var(--color-muted)]">Loading…</TD></TR>
            ) : items.length === 0 ? (
              <TR><TD colSpan={6} className="text-center text-[var(--color-muted)]">No posts found.</TD></TR>
            ) : (
              items.map((p) => (
                <TR key={p.id}>
                  <TD>
                    <div className="flex gap-1">
                      {p.images.slice(0, 3).map((img, i) => (
                        <img
                          key={i}
                          src={img.url}
                          alt={img.alt}
                          className="h-10 w-7 rounded object-cover"
                        />
                      ))}
                      {p.images.length > 3 && (
                        <div className="h-10 w-7 rounded bg-[var(--color-bg)] border flex items-center justify-center text-xs text-[var(--color-muted)]">
                          +{p.images.length - 3}
                        </div>
                      )}
                    </div>
                  </TD>
                  <TD>
                    <Link href={`/posts/${p.id}` as any} className="font-medium hover:underline text-sm line-clamp-2">
                      {p.topic}
                    </Link>
                  </TD>
                  <TD>{p.images.length}</TD>
                  <TD>
                    <Badge variant={STATUS_VARIANT[p.status] ?? 'secondary'}>
                      {STATUS_LABELS[p.status] ?? p.status}
                    </Badge>
                  </TD>
                  <TD className="text-xs text-[var(--color-muted)]">
                    {new Date(p.createdAt).toLocaleDateString('en-US')}
                  </TD>
                  <TD>
                    {p.platformShareUrl && (
                      <a href={p.platformShareUrl} target="_blank" rel="noopener">
                        <ExternalLink className="h-4 w-4 text-[var(--color-muted)] hover:text-[var(--color-accent)]" />
                      </a>
                    )}
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
