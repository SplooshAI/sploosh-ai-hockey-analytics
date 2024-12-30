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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.nhle.com',
        pathname: '/logos/nhl/svg/**',
      }
    ],
  },
};

export default nextConfig; 