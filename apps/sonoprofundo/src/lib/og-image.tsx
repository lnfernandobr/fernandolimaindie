import { ImageResponse } from 'next/og';
import { getChannel } from '@/lib/api';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

/**
 * Renderer compartilhado entre opengraph-image.tsx e twitter-image.tsx.
 *
 * Os arquivos de rota precisam declarar `runtime`/`alt`/`size`/`contentType`
 * estaticamente (o Next analisa em compile-time e não aceita re-export). Aqui
 * fica só a JSX/lógica de renderização que ambos podem chamar.
 */
export async function renderOgImage(): Promise<ImageResponse> {
  const channel = await getChannel().catch(() => null);
  const title = channel?.name ?? 'Sonoprofundo';
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px 96px',
          background: '#0a0e17',
          color: '#e8ecf5',
          fontFamily: 'serif',
        }}
      >
        {/* Camadas mark — top right */}
        <div
          style={{
            position: 'absolute',
            right: '80px',
            top: '72px',
            display: 'flex',
          }}
        >
          <svg width="90" height="90" viewBox="0 0 200 200" fill="none">
            <line x1="40" y1="60" x2="120" y2="60" stroke="#cfd9ff" strokeWidth="14" strokeLinecap="round"/>
            <line x1="30" y1="90" x2="150" y2="90" stroke="#cfd9ff" strokeWidth="14" strokeLinecap="round"/>
            <line x1="50" y1="120" x2="170" y2="120" stroke="#cfd9ff" strokeWidth="14" strokeLinecap="round"/>
            <line x1="80" y1="150" x2="160" y2="150" stroke="#cfd9ff" strokeWidth="14" strokeLinecap="round"/>
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontFamily: 'sans-serif',
              fontSize: 26,
              letterSpacing: 6,
              color: '#cfd9ff',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            {title}
          </div>
          <div style={{ marginTop: 50, fontSize: 64, lineHeight: 1.1, maxWidth: 880, color: '#e8ecf5' }}>
            Dormir mal não é destino.
          </div>
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.1,
              maxWidth: 880,
              fontStyle: 'italic',
              color: '#cfd9ff',
            }}
          >
            É um problema com solução.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            fontFamily: 'sans-serif',
            fontSize: 22,
            color: '#7a8294',
          }}
        >
          Conteúdo baseado em ciência — sonoprofundo.com
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
