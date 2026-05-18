'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { ChannelDto } from '@fernandolimaindie/shared';
import { ChannelForm } from '@/components/ChannelForm';
import { ChannelPosts } from '@/components/ChannelPosts';
import { PageHeader } from '@/components/PageHeader';
import { toast } from '@/components/ui/toast';

export default function EditChannelPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [channel, setChannel] = useState<ChannelDto | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await api<ChannelDto>(`/api/v1/channels/${id}`);
        setChannel(data);
      } catch {
        toast.error('Canal não encontrado');
      }
    })();
  }, [id]);

  if (!channel) {
    return <PageHeader title="Carregando…" />;
  }

  return (
    <div className="space-y-8">
      <PageHeader title={channel.name} description={`/${channel.slug} · ${channel.niche}`} />
      <ChannelForm initial={channel} channelId={channel.id} />
      <ChannelPosts channelId={channel.id} />
    </div>
  );
}
