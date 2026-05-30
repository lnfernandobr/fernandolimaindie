'use client';
import { useState } from 'react';

export function ShareButton({ title, url }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    if (typeof navigator === 'undefined') return;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // usuário cancelou ou não há suporte: segue adiante
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <button onClick={share} className="share-btn" aria-label="Compartilhar este conteúdo">
      <span aria-hidden="true">{copied ? '✓' : '↑'}</span>
      {copied ? 'Copiado!' : 'Compartilhar'}
    </button>
  );
}
