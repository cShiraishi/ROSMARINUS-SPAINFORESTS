import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/rosmarinus-spainforests',
  images: {
    unoptimized: true,
  }
};

export default nextConfig;
