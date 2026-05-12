import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

module.exports = {
  allowedDevOrigins: ["*.local", "*.lan", "lobby", "172.16.217.167"],
};

export default nextConfig;
