/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for the Docker image (standalone server.js output)
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/contact', destination: '/', permanent: true },
    ];
  },
};

module.exports = nextConfig;
