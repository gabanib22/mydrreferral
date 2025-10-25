/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
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
