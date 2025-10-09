import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import { CartProvider } from "./CartProvider";
import { CartProvider } from "./(site)/CartProvider";
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-white text-black/80`}>
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer
            logoSrc="/brand/logo-ballou-update.png"
            companyName="Ballou"
            slogan="Spécialiste d’intérieur"
            facebookPageUrl="https://www.facebook.com/ballou-madagascar"
            menus={[
              { label: "CGV", href: "/cgv" },
              { label: "Contact", href: "/contact" },
              { label: "Cookies", href: "/cookies" },
              { label: "Mentions légales", href: "/mentions-legales" },
            ]}
          />
        </CartProvider>
      </body>
    </html>
  );
}