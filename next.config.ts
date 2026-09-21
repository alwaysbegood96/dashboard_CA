import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['ssh2', 'mysql2', 'pg'],
  allowedDevOrigins: ['10.101.8.111', '10.101.8.111:3001'],
};

export default nextConfig;
