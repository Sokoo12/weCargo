/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'doodleipsum.com',
      },
    ],
    // Optimize image loading and caching
    minimumCacheTTL: 60,
    formats: ['image/webp'],
  },
  // Enable output compression
  compress: true,
  // Optimize builds
  reactStrictMode: true,
  // Improve production performance
  poweredByHeader: false,
  // Improve page loading performance with ISR by default
  staticPageGenerationTimeout: 120,
};

module.exports = nextConfig; 