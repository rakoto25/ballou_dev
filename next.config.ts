// next.config.ts
/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

// S’il n’y a pas de NEXT_BASE_PATH fourni, on peut déduire /<repo> en CI GitHub
const inferFromRepo =
  process.env.GITHUB_REPOSITORY
    ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}`
    : '';

const basePath =
  process.env.NEXT_BASE_PATH ||
  (isProd ? inferFromRepo : '');

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: 'https', hostname: 'picsum.photos' }],
  },
};

module.exports = nextConfig;
