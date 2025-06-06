/** @type {import('next').NextConfig} */
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
  // For production deployment with static export
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true
    }
  })
};

module.exports = nextConfig;
