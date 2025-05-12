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
  // Add CORS headers for API routes
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 