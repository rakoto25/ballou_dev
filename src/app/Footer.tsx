"use client";

import React, { useEffect } from "react";
import Link from "next/link";

// Footer configurable pour Ballou
// - Colonne gauche : logo + slogan
// - Colonne milieu : menus utiles (CGV, Contact, Cookies, etc.)
// - Colonne droite : "canvas" Facebook
//   • soit un embed de la Page Facebook (timeline)
//   • soit une carte manuelle du dernier post/pub (image + lien)
//
// Couleurs de marque (défaut):
//  - Primaire  : #e94e1a
//  - Foncé     : #29235c
//
// ✅ Utilisation :
// <Footer
//   logoSrc="/logo-ballou.svg"
//   companyName="Ballou"
//   slogan="Votre style, notre passion."
//   brandPrimary="#e94e1a"
//   brandDark="#29235c"
//   facebookPageUrl="https://www.facebook.com/votrepage" // ou laissez vide pour mode manuel
//   latestPromo={{ image: "/images/derniere-pub.jpg", title: "Promo -20% ce week-end", link: "https://facebook.com/permalink/...", date: "18 sept. 2025" }}
//   menus={[{ label: "CGV", href: "/cgv" }, { label: "Contact", href: "/contact" }, { label: "Cookies", href: "/cookies" }, { label: "Mentions légales", href: "/mentions-legales" }]}
// />

export type FooterMenu = { label: string; href: string };
export type FooterPromo = { image: string; title: string; link: string; date?: string };

export interface FooterProps {
    logoSrc: string;
    companyName: string;
    slogan: string;
    menus?: FooterMenu[];
    facebookPageUrl?: string; // Active l'embed officiel Facebook Page Plugin
    latestPromo?: FooterPromo; // Affichage manuel si pas d'URL de page FB
    brandPrimary?: string; // #e94e1a
    brandDark?: string; // #29235c
}

// Typage propre pour autoriser les variables CSS custom dans style={}
type FooterCSSVars = React.CSSProperties & {
    ["--brand-primary"]?: string;
    ["--brand-dark"]?: string;
};

export default function Footer({
    logoSrc,
    companyName,
    slogan,
    menus = [
        { label: "CGV", href: "/cgv" },
        { label: "Contact", href: "/contact" },
        { label: "Cookies", href: "/cookies" },
    ],
    facebookPageUrl,
    latestPromo,
    brandPrimary = "#e94e1a",
    brandDark = "#29235c",
}: FooterProps) {
    // Charge le SDK Facebook uniquement si on veut l'embed de la page
    useEffect(() => {
        if (!facebookPageUrl) return;
        if (document.getElementById("facebook-jssdk")) return; // déjà chargé

        const script = document.createElement("script");
        script.id = "facebook-jssdk";
        script.async = true;
        script.defer = true;
        script.crossOrigin = "anonymous";
        script.src = "https://connect.facebook.net/fr_FR/sdk.js#xfbml=1&version=v19.0";
        script.onload = () => {
            try {
                // Reparse si le SDK est prêt
                (window as any)?.FB?.XFBML?.parse?.();
            } catch { }
        };
        document.body.appendChild(script);
    }, [facebookPageUrl]);

    const year = new Date().getFullYear();

    // Variables CSS exposées au tailwind arbitrary values (ex: text-[var(--brand-primary)])
    const styleVars: FooterCSSVars = {
        "--brand-primary": brandPrimary,
        "--brand-dark": brandDark,
        borderColor: "#ffffff1a", // blanc/10 pour la bordure
    };

    return (
        <footer className="mt-16 border-t bg-[var(--brand-dark)] text-white" style={styleVars}>
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
                {/* Colonne gauche : logo + slogan */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <img src={logoSrc} alt={`${companyName} logo`} className="h-10 w-auto" />
                        <span className="sr-only">{companyName}</span>
                    </div>
                    <p className="max-w-sm text-sm leading-relaxed text-white/80">{slogan}</p>
                </div>

                {/* Colonne milieu : menus utiles (liste verticale) */}
                <nav aria-label="Liens utiles">
                    <ul className="space-y-2">
                        {menus.map((m) => (
                            <li key={m.href + m.label}>
                                <Link
                                    href={m.href}
                                    className="group flex w-fit items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-[var(--brand-primary)]"
                                >
                                    <span>{m.label}</span>
                                    <svg
                                        className="opacity-0 transition group-hover:opacity-100"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M7 17l8-8M11 7h4v4"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Colonne droite : Canvas Facebook */}
                <div className="md:justify-self-end">
                    <div className="w-full max-w-sm">
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--brand-primary)]">
                            Dernière publication
                        </h3>

                        {facebookPageUrl ? (
                            // Embed officiel : Facebook Page Plugin (timeline)
                            <div className="rounded-xl border bg-white p-3 text-zinc-900 shadow-sm" style={{ borderColor: "#e5e7eb" }}>
                                {/* Conteneur requis par le SDK FB */}
                                <div id="fb-root" />
                                <div
                                    className="fb-page"
                                    data-href={facebookPageUrl}
                                    data-tabs="timeline"
                                    data-width="400"
                                    data-height="200"
                                    data-small-header="false"
                                    data-adapt-container-width="true"
                                    data-hide-cover="false"
                                    data-show-facepile="false"
                                >
                                    <blockquote cite={facebookPageUrl} className="fb-xfbml-parse-ignore">
                                        <a href={facebookPageUrl}>Facebook</a>
                                    </blockquote>
                                </div>
                            </div>
                        ) : latestPromo ? (
                            // Mode manuel : carte mini-post configurable
                            <a
                                href={latestPromo.link}
                                target="_blank"
                                rel="noreferrer"
                                className="group block overflow-hidden rounded-xl border bg-white text-zinc-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                style={{ borderColor: "#e5e7eb" }}
                            >
                                <div className="aspect-[16/9] w-full overflow-hidden">
                                    <img
                                        src={latestPromo.image}
                                        alt={latestPromo.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex items-start justify-between gap-3 p-3">
                                    <div>
                                        <h4 className="line-clamp-2 text-sm font-semibold">{latestPromo.title}</h4>
                                        {latestPromo.date && <p className="mt-1 text-xs text-zinc-500">{latestPromo.date}</p>}
                                    </div>
                                    {/* badge FB */}
                                    <span
                                        className="rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide"
                                        style={{ borderColor: "var(--brand-primary)", color: "var(--brand-primary)" }}
                                    >
                                        Facebook
                                    </span>
                                </div>
                            </a>
                        ) : (
                            // Placeholder si rien n'est encore fourni
                            <div className="rounded-xl border border-dashed border-white/25 p-6 text-sm text-white/70">
                                Ajoutez <code>facebookPageUrl</code> ou <code>latestPromo</code> dans les props pour afficher la dernière pub.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="border-t" style={{ borderColor: "#ffffff1a" }}>
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-sm text-white/70 sm:flex-row sm:px-6 lg:px-8">
                    <p>© {year} {companyName}. Tous droits réservés.</p>
                    <p>
                        Conçu avec <span aria-hidden>l&apos;équipe </span> du groupe {companyName}.
                    </p>
                </div>
            </div>
        </footer>
    );
}
