// @ts-check

/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

// le site vit sous: https://dev.balloupro.mg/apps/ballou-dev/
const defaultBasePath = '/apps/ballou-dev';
const basePath = process.env.NEXT_BASE_PATH || (isProd ? defaultBasePath : '');

const nextConfig = {
  // export statique => génère /out
  // (plus besoin d'app Node côté serveur)
  output: 'export',            // cf. docs static export
  trailingSlash: true,         // facilite l'hébergement dans un sous-dossier
  basePath,                    // sert les URLs sous /apps/ballou-dev
  assetPrefix: basePath ? `${basePath}/` : undefined,

  // next/image sans optimisation serveur (compatible export statique)
  images: {
    unoptimized: true,         // important en mode static export
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      // ajoute d'autres domaines ici si besoin
    ],
  },
};

module.exports = nextConfig;
