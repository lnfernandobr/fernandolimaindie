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
          padding: '80px',
          backgroundImage: 'linear-gradient(135deg, #0a0d14 0%, #171c27 100%)',
          color: '#e8e4d8',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '60px',
            top: '60px',
            width: '160px',
            height: '160px',
            borderRadius: '80px',
            background:
              'radial-gradient(circle at 70% 35%, #e8b66a 0%, #c89456 60%, transparent 70%)',
            opacity: 0.85,
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontFamily: 'sans-serif',
              fontSize: 26,
              letterSpacing: 6,
              color: '#e8b66a',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            {title}
          </div>
          <div style={{ marginTop: 50, fontSize: 64, lineHeight: 1.1, maxWidth: 880 }}>
            Dormir mal não é destino.
          </div>
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.1,
              maxWidth: 880,
              fontStyle: 'italic',
              color: '#e8b66a',
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
            color: 'rgba(232,228,216,0.62)',
          }}
        >
          Conteúdo baseado em ciência — sonoprofundo.com
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
