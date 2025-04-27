/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/radar',
        has: [
          {
            type: 'host',
            value: 'radar.coreframeai.com',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
