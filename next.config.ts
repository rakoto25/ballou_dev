import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        // pathname: "/**", // optionnel
      },
      // 👉 Quand tu passeras sur WordPress, ajoute ton domaine ici :
      // { protocol: "https", hostname: "ton-domaine-wp.tld" },
      // { protocol: "http",  hostname: "localhost" }, // si tu sers des images en local http
    ],
  },
};

export default nextConfig;