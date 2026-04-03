import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["@coco-kit/ui"],
  typedRoutes: true,
};

export default nextConfig;
