import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@fernandolimaindie/shared'],
  typedRoutes: true,
  images: {
    remotePatterns: [{ protocol: 'http', hostname: 'localhost' }],
  },
};

export default config;
