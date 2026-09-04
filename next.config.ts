import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "my_muscles_factory.com",
    "*.my_muscles_factory.com",
    "test_store_unique_slug324.com",
    "zoyee.in",
    "*.zoyee.in",
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
    "172.16.4.167",
    "localhost:3000"
  ]
} as any;

export default nextConfig;
