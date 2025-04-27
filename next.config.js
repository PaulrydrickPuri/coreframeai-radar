/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        has: [{ type: 'host', value: 'radar.coreframeai.com' }],
        source: '/:path*',
        destination: '/radar/:path*'
      },
      // Default rewrite for development and Vercel domain
      {
        source: '/',
        destination: '/radar'
      }
    ];
  },
};

module.exports = nextConfig;
