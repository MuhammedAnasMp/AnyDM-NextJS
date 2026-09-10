import type { NextConfig } from "next";

const backendUrl =
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
  // allowedDevOrigins: [
  //   "zoyee.in",
  //   "*.zoyee.in",
  //   "localapi.locanydm.online",
  //   "*.locanydm.online",

  //   "*.anydm.in",
  //   "*.com",
  //   "*.in",
  //   "*.org",
  //   "*.net",
  //   "*.co",
  //   "*.io",
  //   "*.dev",
  //   "*.app",
  //   "*.store",
  //   "*.shop",
  //   "*.xyz",
  //   "localhost:3000",
  // ],

  allowedDevOrigins: [
    "zoyee.in",
    "*.zoyee.in",
    "anydm.in",
    "*.anydm.in",
    "locanydm.online",
    "*.locanydm.online",
  ],
} as any;

export default nextConfig;
