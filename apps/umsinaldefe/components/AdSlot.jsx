'use client';

import { useEffect } from 'react';
import { siteConfig } from '@/lib/site-config.js';

export function AdSlot({ slot, format = 'auto', fullWidthResponsive = true }) {
  const client = siteConfig.adsense.client;

  useEffect(() => {
    if (!client) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle not loaded yet
    }
  }, [client]);

  if (!client) return null;

  return (
    <div className="ad-slot" aria-hidden="true">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={String(fullWidthResponsive)}
      />
    </div>
  );
}
