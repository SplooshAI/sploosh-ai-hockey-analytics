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
      },
      {
        protocol: 'https',
        hostname: 'assets.nhle.com',
        pathname: '/special_event_season/**',
      }
    ],
  },
};

export default nextConfig; 