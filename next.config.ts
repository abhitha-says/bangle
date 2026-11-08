import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // A stray package-lock.json in the home folder must not be mistaken for the root.
  turbopack: { root: path.resolve(__dirname) },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [72, 82, 90],
    deviceSizes: [480, 640, 750, 828, 1080, 1200, 1600, 1920, 2400],
    imageSizes: [96, 160, 240, 320, 400],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      {
        source: "/media/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
