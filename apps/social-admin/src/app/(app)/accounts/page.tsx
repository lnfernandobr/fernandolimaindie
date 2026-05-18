'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { SocialAccountDto } from '@fernandolimaindie/shared';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function AccountsPage() {
  const [items, setItems] = useState<SocialAccountDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await api<{ items: SocialAccountDto[] }>('/api/v1/social/accounts');
      setItems(data.items);
    } catch {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }

  async function toggle(id: string) {
    try {
      await api(`/api/v1/social/accounts/${id}/toggle`, { method: 'PATCH' });
      void load();
    } catch {
      toast.error('Failed to update account');
    }
  }

  async function remove(id: string) {
    if (!confirm('Remove this account? Campaigns using it will stop working.')) return;
    try {
      await api(`/api/v1/social/accounts/${id}`, { method: 'DELETE' });
      toast.success('Account removed');
      void load();
    } catch {
      toast.error('Failed to remove account');
    }
  }

  return (
    <>
      <PageHeader
        title="Accounts"
        description="Connected social media accounts. Each campaign needs a linked account to post."
        actions={
          <Button asChild>
            <Link href="/accounts/tiktok">
              <Plus className="h-4 w-4" /> Connect TikTok
            </Link>
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-[var(--color-muted)]">Loading…</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[var(--color-muted)] mb-4">No accounts connected yet.</p>
            <Button asChild>
              <Link href="/accounts/tiktok">Connect TikTok account</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((account) => (
            <Card key={account.id}>
              <CardContent className="py-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
                  <span className="text-[var(--color-accent)] font-bold text-sm">TK</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">@{account.username}</div>
                  {account.displayName && (
                    <div className="text-xs text-[var(--color-muted)]">{account.displayName}</div>
                  )}
                  <div className="text-xs text-[var(--color-muted)] mt-0.5">
                    {account.platform.toUpperCase()}
                    {account.tokenExpiresAt &&
                      ` · token expires ${new Date(account.tokenExpiresAt).toLocaleDateString('en-US')}`}
                  </div>
                </div>
                <Badge variant={account.active ? 'success' : 'secondary'}>
                  {account.active ? 'active' : 'paused'}
                </Badge>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggle(account.id)}
                    title={account.active ? 'Pause' : 'Activate'}
                  >
                    {account.active ? (
                      <ToggleRight className="h-4 w-4 text-[var(--color-accent)]" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(account.id)}
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
