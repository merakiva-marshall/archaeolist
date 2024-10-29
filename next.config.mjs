// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.archaeolist.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;