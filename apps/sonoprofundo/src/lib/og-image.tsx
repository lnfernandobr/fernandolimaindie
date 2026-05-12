import { ImageResponse } from 'next/og';
import { getChannel } from '@/lib/api';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

export async function renderOgImage(): Promise<ImageResponse> {
  const channel = await getChannel().catch(() => null);
  const rawName = channel?.name ?? 'sono profundo';
  const siteName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '0 100px',
          background: '#0a0e17',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Fundo — linhas decorativas grandes */}
        <div style={{ position: 'absolute', right: '-40px', top: '80px', opacity: 0.08, display: 'flex' }}>
          <svg width="560" height="400" viewBox="0 0 200 200" fill="none">
            <line x1="40" y1="60" x2="120" y2="60" stroke="#cfd9ff" strokeWidth="14" strokeLinecap="round"/>
            <line x1="30" y1="90" x2="150" y2="90" stroke="#cfd9ff" strokeWidth="14" strokeLinecap="round"/>
            <line x1="50" y1="120" x2="170" y2="120" stroke="#cfd9ff" strokeWidth="14" strokeLinecap="round"/>
            <line x1="80" y1="150" x2="160" y2="150" stroke="#cfd9ff" strokeWidth="14" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Barra lateral esquerda */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 8,
            height: '100%',
            background: '#cfd9ff',
            opacity: 0.6,
          }}
        />

        {/* Conteúdo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, zIndex: 1 }}>
          {/* Mark pequeno */}
          <div style={{ display: 'flex', marginBottom: 32 }}>
            <svg width="52" height="52" viewBox="0 0 200 200" fill="none">
              <line x1="40" y1="60" x2="120" y2="60" stroke="#cfd9ff" strokeWidth="14" strokeLinecap="round"/>
              <line x1="30" y1="90" x2="150" y2="90" stroke="#cfd9ff" strokeWidth="14" strokeLinecap="round"/>
              <line x1="50" y1="120" x2="170" y2="120" stroke="#cfd9ff" strokeWidth="14" strokeLinecap="round"/>
              <line x1="80" y1="150" x2="160" y2="150" stroke="#cfd9ff" strokeWidth="14" strokeLinecap="round"/>
            </svg>
          </div>

          {/* Nome do site */}
          <div
            style={{
              fontFamily: 'sans-serif',
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: 4,
              color: '#cfd9ff',
              textTransform: 'uppercase',
              marginBottom: 28,
            }}
          >
            {siteName}
          </div>

          {/* Headline principal */}
          <div
            style={{
              fontFamily: 'serif',
              fontSize: 72,
              fontWeight: 400,
              lineHeight: 1.1,
              color: '#e8ecf5',
              maxWidth: 860,
              marginBottom: 8,
            }}
          >
            Dormir mal não é destino.
          </div>
          <div
            style={{
              fontFamily: 'serif',
              fontSize: 72,
              fontWeight: 400,
              lineHeight: 1.1,
              fontStyle: 'italic',
              color: '#cfd9ff',
              maxWidth: 860,
              marginBottom: 56,
            }}
          >
            É um problema com solução.
          </div>

          {/* URL */}
          <div
            style={{
              fontFamily: 'sans-serif',
              fontSize: 22,
              color: '#7a8294',
              letterSpacing: 1,
            }}
          >
            sonoprofundo.com
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
