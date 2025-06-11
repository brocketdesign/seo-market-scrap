/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  images: {
    domains: [
      'images-na.ssl-images-amazon.com',
      'm.media-amazon.com',
      'images-amazon.com',
      'amazon.com',
      'thumbnail.image.rakuten.co.jp',
      'rakuten.co.jp',
      'shop.r10s.jp'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazon.com',
        pathname: '/**',
      }
    ]
  },
  // For production deployment
  ...(process.env.NODE_ENV === 'production' && {
    trailingSlash: true,
    images: {
      unoptimized: true
    }
  }),
  webpack: (config) => {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    return config;
  }
};

module.exports = nextConfig;
