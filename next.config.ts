/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const isVercel = !!process.env.VERCEL;

// Chemin cPanel (sous-dossier)
const CPANEL_BASE = '/apps/ballou-dev';

// Sur Vercel: pas de basePath. Sur cPanel: basePath (sauf si tu le overrides via NEXT_BASE_PATH)
const basePath = isVercel
  ? ''
  : (process.env.NEXT_BASE_PATH ?? (isProd ? CPANEL_BASE : ''));

// Sur Vercel, pas d'assetPrefix
const assetPrefix = isVercel ? undefined : (basePath ? `${basePath}/` : undefined);

const nextConfig = {
  output: 'export',       // tu peux le garder: Vercel sait servir l'export statique
  trailingSlash: true,
  basePath,
  assetPrefix,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      // ajoute tes domaines si besoin
    ],
  },
};

module.exports = nextConfig;
