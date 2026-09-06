import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // a stray package-lock.json above the repo makes Next infer the wrong workspace root
  outputFileTracingRoot: path.join(import.meta.dirname, '../..'),
  eslint: {
    // this repo lints with biome, so next's bundled eslint pass has nothing to run
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
