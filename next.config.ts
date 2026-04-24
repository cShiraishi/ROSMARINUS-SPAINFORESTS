import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/rosmarinus-spainforests',
  trailingSlash: true,
  images: {
    unoptimized: true,
  }
};

export default nextConfig;
