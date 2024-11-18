/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['firebasestorage.googleapis.com']
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        async_hooks: false,
      };
    }

    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'firebase/auth': 'firebase/auth/react-native'
      };
    }

    return config;
  },
  transpilePackages: ['@firebase/auth'],
  output: 'standalone',
  experimental: {
    // This will help with static generation
    workerThreads: false,
    cpus: 1
  }
};

module.exports = nextConfig; 