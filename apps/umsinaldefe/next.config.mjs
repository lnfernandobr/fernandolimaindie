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
