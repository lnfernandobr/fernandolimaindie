'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { ExternalLink, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function TikTokConnectPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--color-muted)]">Loading…</p>}>
      <TikTokConnectContent />
    </Suspense>
  );
}

function TikTokConnectContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const message = searchParams.get('message');
  const [loadingUrl, setLoadingUrl] = useState(false);

  useEffect(() => {
    if (status === 'success') toast.success('TikTok account connected successfully');
    if (status === 'error') toast.error(message ?? 'Failed to connect TikTok');
  }, [status, message]);

  async function connect() {
    setLoadingUrl(true);
    try {
      const { url } = await api<{ url: string; state: string }>(
        '/api/v1/social/accounts/tiktok/auth-url',
      );
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to get auth URL');
      setLoadingUrl(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Connect TikTok"
        description="Link your TikTok account to allow automated carousel posting."
      />

      <div className="max-w-lg space-y-6">
        {status === 'success' && (
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30 px-4 py-3">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-300">
              Account connected successfully. You can now create campaigns.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 px-4 py-3">
            <XCircle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{message ?? 'Connection failed'}</p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
            <CardDescription>
              We use TikTok's official Content Posting API to upload carousels.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <ol className="space-y-3 list-decimal list-inside text-[var(--color-muted)]">
              <li>Click <strong className="text-[var(--color-fg)]">Connect TikTok</strong> and authorize the app in TikTok.</li>
              <li>Posts are uploaded as <strong className="text-[var(--color-fg)]">private</strong> (only visible to you).</li>
              <li>You receive an email when each post is ready.</li>
              <li>Open TikTok, find the post, pick a song, then make it public.</li>
            </ol>
            <div className="rounded-md bg-[var(--color-bg)] border px-4 py-3 text-xs text-[var(--color-muted)]">
              Required permission: <code>photo.publish</code>
            </div>
            <Button onClick={connect} disabled={loadingUrl} className="w-full">
              {loadingUrl ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Redirecting…
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" /> Connect TikTok account
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
