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
  // Enable Turbopack for both development and builds (stable configuration)
  turbopack: {
    rules: {
      "*.svg": ["@svgr/webpack"],
    },
  },
  // Enable standalone output mode for production Docker deployment
  output: 'standalone',
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
        pathname: '/logos/ntl/svg/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.nhle.com',
        pathname: '/logos/default/**',
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