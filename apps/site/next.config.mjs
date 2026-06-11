/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@sixtyfour-demos/api-client",
    "@sixtyfour-demos/ui",
    "@sixtyfour-demos/utils",
  ],
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
