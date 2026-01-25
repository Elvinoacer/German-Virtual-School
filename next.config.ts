import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // Support large file uploads (100MB+ documents)
  experimental: {
    serverActions: {
      bodySizeLimit: '150mb',
    },
  },
};

export default nextConfig;
