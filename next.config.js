/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip eslint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable most common warnings
  reactStrictMode: false
};

module.exports = nextConfig; 