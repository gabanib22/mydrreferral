/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental:{
    serverActions: true,
  },
  async headers() {
    return [
      {
        source: '/',
        headers: [
          // Testing purpose, passing this key returns current browser-viewport-width in Request-Headers which we can get from 
          {
            key: 'Accept-CH',
            value: 'Viewport-Width',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig;
