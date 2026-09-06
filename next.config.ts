import type { NextConfig } from "next";

const backendUrl =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://localapi.locanydm.online";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl.replace(/\/$/, "")}/api/:path*`,
      },
    ];
  },
  allowedDevOrigins: [
    "zoyee.in",
    "*.zoyee.in",
    "localapi.locanydm.online",
    "*.locanydm.online",
    "my_muscles_factory.com",
    "*.my_muscles_factory.com",
    "test_store_unique_slug324.com",
    "*.anydm.in",
    "*.com",
    "*.in",
    "*.org",
    "*.net",
    "*.co",
    "*.io",
    "*.dev",
    "*.app",
    "*.store",
    "*.shop",
    "*.xyz",
    "localhost:3000",
  ],
} as any;

export default nextConfig;
