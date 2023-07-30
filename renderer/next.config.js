const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  transpilePackages: ["@material-tailwind/react"],
  distDir: "build",
  images: { unoptimized: true },
};

module.exports = withBundleAnalyzer(nextConfig);
