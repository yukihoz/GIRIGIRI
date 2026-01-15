import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/GIRIGIRI",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
