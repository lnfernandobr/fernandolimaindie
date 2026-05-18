'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { SocialCampaignDto } from '@fernandolimaindie/shared';
import { PageHeader } from '@/components/PageHeader';
import { CampaignForm } from '@/components/CampaignForm';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { Trash2 } from 'lucide-react';

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<SocialCampaignDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load();
  }, [id]);

  async function load() {
    try {
      const data = await api<SocialCampaignDto>(`/api/v1/social/campaigns/${id}`);
      setCampaign(data);
    } catch {
      toast.error('Campaign not found');
      router.replace('/campaigns');
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!confirm('Delete this campaign? This cannot be undone.')) return;
    try {
      await api(`/api/v1/social/campaigns/${id}`, { method: 'DELETE' });
      toast.success('Campaign deleted');
      router.replace('/campaigns');
    } catch {
      toast.error('Failed to delete campaign');
    }
  }

  if (loading) return <p className="text-[var(--color-muted)] text-sm">Loading…</p>;
  if (!campaign) return null;

  return (
    <>
      <PageHeader
        title={campaign.name}
        description={`${campaign.niche} · ${campaign.imageCount} slides per post`}
        actions={
          <Button variant="destructive" size="sm" onClick={remove}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        }
      />
      <CampaignForm campaign={campaign} />
    </>
  );
}
