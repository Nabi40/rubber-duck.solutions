/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  experimental: {
    disableOptimizedLoading: true,
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  reactStrictMode: true,
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (isServer) return config;
    // ensure client-only dynamic import resolves
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false };
    return config;
  },
  swcMinify: true,
  output: 'standalone',
  transpilePackages: ['@imgly/background-removal'],
};

export default nextConfig;
