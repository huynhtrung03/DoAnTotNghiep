import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  staticPageGenerationTimeout: 180,
  // target: 'serverless', // add this line
  images: {
    // domains: ["antimatter.vn", "cdn.luatminhkhue.vn"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};
export default nextConfig;
