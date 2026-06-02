/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.cloudfront.net' },
    ],
  },

  async headers() {
    return [
      // CORS pras rotas de admin (chamadas pelo dashboard externo)
      {
        source: '/api/admin/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin',  value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PATCH, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Authorization, Content-Type' },
          { key: 'Access-Control-Max-Age',       value: '86400' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/favicon.svg',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },

  async redirects() {
    return [
      // Força o domínio canônico: bloqueia URLs vercel.app de serem indexadas
      // e garante que o CORS funciona na URL certa
      {
        source: '/:path*',
        has: [{ type: 'host', value: '(?!www\\.umsinaldefe\\.com\\.br)umsinaldefe\\.com\\.br' }],
        destination: 'https://www.umsinaldefe.com.br/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
