import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },
  // Disable git integration
  experimental: {
    disableOptimizedLoading: true,
  },
  images: {
    domains: [
      // Add any domains that host your team logos
      'assets.nhle.com',  // NHL's asset domain
    ],
  },
};

export default nextConfig; 