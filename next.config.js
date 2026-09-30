/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'images.unsplash.com',
      'res.cloudinary.com',
      'imagedelivery.net',
      'pub-bd139b4c67a1408db26fbbb5a04fdedb.r2.dev'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '**.cloudflarestorage.com',
      },
    ],
  }
};

module.exports = nextConfig;
