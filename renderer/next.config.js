const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@material-tailwind/react"],
  images: { unoptimized: true },
};

module.exports = withBundleAnalyzer(nextConfig);
