/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const isVercel = !!process.env.VERCEL;

// 👉 On n'active l'export statique qu'en PROD et hors Vercel (ex: cPanel)
const useExport = isProd && !isVercel;

const basePath = useExport
  ? (process.env.NEXT_BASE_PATH ?? '/apps/ballou-dev')
  : '';

const assetPrefix = useExport && basePath ? `${basePath}/` : undefined;

const nextConfig = {
  output: useExport ? 'export' : undefined,
  trailingSlash: true,
  basePath,
  assetPrefix,
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: 'https', hostname: 'picsum.photos' }],
  },
};

module.exports = nextConfig;