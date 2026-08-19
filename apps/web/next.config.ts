import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@repo/api-client",
    "@repo/contract",
    "@repo/db-schema",
    "@repo/i18n",
    "@repo/ui",
    "@repo/ui-web",
  ],
};

export default nextConfig;
