import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  }
};

export default nextConfig;
