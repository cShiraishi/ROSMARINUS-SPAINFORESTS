import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/ROSMARINUS-SPAINFORESTS',
  trailingSlash: true,
  images: {
    unoptimized: true,
  }
};

export default nextConfig;
