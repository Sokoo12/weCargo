import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["doodleipsum.com", "img.clerk.com"], // Add the domain(s) you want to allow
  },
};

export default nextConfig;
