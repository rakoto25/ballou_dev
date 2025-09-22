import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// ⬇️ Importe tes composants globaux
import Header from "./Header";
import Footer from "./Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ballou — Spécialiste d’intérieur",
  description:
    "Meubles, literie, tapis, déco et art de la table. Design épuré et fonctionnel.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-white text-black/80`}
      >
        {/* Header global (ta charte est gérée dans le composant) */}
        <Header />

        {/* Contenu des pages (ex: Homepage.tsx via app/(site)/page.tsx) */}
        <main className="flex-1">{children}</main>

        {/* Footer global */}
        <Footer
          logoSrc="/brand/logo-ballou-update.png"
          companyName="Ballou"
          slogan="Spécialiste d’intérieur"
          facebookPageUrl="https://www.facebook.com/ballou-madagascar" // pour l’embed auto
          // OU mode manuel :
          // latestPromo={{
          //   image: "/images/derniere-pub.jpg",
          //   title: "Promo -20% ce week-end",
          //   link: "https://facebook.com/permalink/…",
          //   date: "18 sept. 2025",
          // }}
          menus={[
            { label: "CGV", href: "/cgv" },
            { label: "Contact", href: "/contact" },
            { label: "Cookies", href: "/cookies" },
            { label: "Mentions légales", href: "/mentions-legales" },
          ]}
        />
      </body>
    </html>
  );
}