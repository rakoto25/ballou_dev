import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';
const isVercel = !!process.env.VERCEL;

// 👉 On n'active l'export statique qu'en PROD et hors Vercel (ex: cPanel)
const useExport = isProd && !isVercel;

const basePath = useExport
  ? (process.env.NEXT_BASE_PATH ?? '/apps/ballou-dev')
  : '';

const assetPrefix = useExport && basePath ? `${basePath}/` : undefined;

/**
 * IMPORTANT :
 * - En dev, on expose /ballou/wp-json/* côté Next et on proxy vers le WP local.
 *   Ça permet de faire correspondre le chemin du cookie (Path=/ballou/) et
 *   d'éviter les soucis SameSite/cross-origin.
 * - En production, adapte/supprime le rewrite selon ton infra.
 */
const nextConfig: NextConfig = {
  output: useExport ? 'export' : undefined,
  trailingSlash: true,
  basePath,
  assetPrefix,
  reactStrictMode: true,

  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: 'https', hostname: 'picsum.photos' }],
  },

  async rewrites() {
    if (isProd) {
      // En prod on ne proxy pas vers localhost
      return [];
    }
    return [
      // ✅ On garde le même prefixe que le dossier WP (/ballou/)
      {
        source: '/ballou/wp-json/:path*',
        destination: 'http://localhost/ballou/wp-json/:path*',
      },
    ];
  },

  // Variables d'environnement exposées côté client
  env: {
    // ✅ Utiliser le chemin aligné avec le cookie (Path=/ballou/)
    NEXT_PUBLIC_BALLOU_API_BASE: '/ballou/wp-json/ballou/v1',
  },
};

export default nextConfig;