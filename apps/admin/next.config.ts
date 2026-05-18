import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@fernandolimaindie/shared'],
  typedRoutes: true,
};

export default config;
