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
};

export default nextConfig; 