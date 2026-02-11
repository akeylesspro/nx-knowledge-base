import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    turbopack: {},
    reactCompiler: true,
    output: "standalone",
};

export default nextConfig;
