"use client";

import React from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

// ✅ Installation (une seule fois dans le projet):
//   npm i keen-slider
// 
// ✅ Usage:
//   <OurSelects /> dans votre page d'accueil
//
// 🔌 Plus tard: branchement WooCommerce REST (exemple en bas du fichier)

// ---------- Types ----------
interface Product {
    id: string;
    title: string;
    category: string;
    priceMGA: number;
    ref: string;
    img: string; // URL absolue pour éviter la config next/image
}

// ---------- Données statiques (exemple) ----------
const PRODUCTS: Product[] = [
    {
        id: "p1",
        title: "T-shirt Oversize Unisexe",
        category: "Tops",
        priceMGA: 69000,
        ref: "TRI-TS-001",
        img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop",
    },
    {
        id: "p2",
        title: "Veste Denim Stonewashed",
        category: "Vestes",
        priceMGA: 219000,
        ref: "TRI-JK-204",
        img: "https://images.unsplash.com/photo-1483985977821-d9e9aa3f5d3f?q=80&w=1200&auto=format&fit=crop",
    },
    {
        id: "p3",
        title: "Robe Midi Côtelée",
        category: "Robes",
        priceMGA: 179000,
        ref: "TRI-RB-112",
        img: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1200&auto=format&fit=crop",
    },
    {
        id: "p4",
        title: "Sneakers Minimalistes",
        category: "Chaussures",
        priceMGA: 359000,
        ref: "TRI-SNK-078",
        img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
    },
    {
        id: "p5",
        title: "Pantalon Carotte Tailleur",
        category: "Pantalons",
        priceMGA: 199000,
        ref: "TRI-PT-310",
        img: "https://images.unsplash.com/photo-1585914924626-15adac1e6403?q=80&w=1200&auto=format&fit=crop",
    },
    {
        id: "p6",
        title: "Chemise Lin Premium",
        category: "Chemises",
        priceMGA: 149000,
        ref: "TRI-CH-077",
        img: "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop",
    },
    {
        id: "p7",
        title: "Hoodie Zippé",
        category: "Sweats",
        priceMGA: 159000,
        ref: "TRI-HD-441",
        img: "https://images.unsplash.com/photo-1503342452485-86ff0a8639e9?q=80&w=1200&auto=format&fit=crop",
    },
    {
        id: "p8",
        title: "Sac Cabas City",
        category: "Maroquinerie",
        priceMGA: 249000,
        ref: "TRI-BG-025",
        img: "https://images.unsplash.com/photo-1553062357-b8ef75c0928f?q=80&w=1200&auto=format&fit=crop",
    },
    {
        id: "p9",
        title: "Casquette Logo",
        category: "Accessoires",
        priceMGA: 49000,
        ref: "TRI-CP-909",
        img: "https://images.unsplash.com/photo-1520975693416-35f29c690b49?q=80&w=1200&auto=format&fit=crop",
    },
    {
        id: "p10",
        title: "Jupe Plissée",
        category: "Jupes",
        priceMGA: 139000,
        ref: "TRI-JP-076",
        img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop",
    },
    {
        id: "p11",
        title: "Mocassins Cuir",
        category: "Chaussures",
        priceMGA: 389000,
        ref: "TRI-SHO-555",
        img: "https://images.unsplash.com/photo-1582582621956-dfdbf11a3f69?q=80&w=1200&auto=format&fit=crop",
    },
    {
        id: "p12",
        title: "Tote Bag Coton",
        category: "Accessoires",
        priceMGA: 29000,
        ref: "TRI-TB-120",
        img: "https://images.unsplash.com/photo-1520975594084-6f7b55f94a3b?q=80&w=1200&auto=format&fit=crop",
    },
];

// ---------- Utilitaires ----------
const fmtMGA = (v: number) =>
    new Intl.NumberFormat("fr-MG", { style: "currency", currency: "MGA", maximumFractionDigits: 0 }).format(v);

// ---------- Composant Carte Produit ----------
function ProductCard({ p }: { p: Product }) {
    return (
        <article className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white/80 shadow-sm backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="relative aspect-[4/5] w-full overflow-hidden">
                <img
                    src={p.img}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
                <span className="absolute left-3 top-3 rounded-full bg-black/75 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                    {p.category}
                </span>
            </div>

            <div className="flex flex-col gap-2 p-4">
                <h3 className="line-clamp-1 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {p.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Ref. {p.ref}</p>
                <div className="mt-1 flex items-center justify-between">
                    <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">{fmtMGA(p.priceMGA)}</span>
                    <button
                        type="button"
                        className="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 active:scale-[0.98] dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                        onClick={() => alert(`Ajouter au panier: ${p.title}`)}
                    >
                        Ajouter
                    </button>
                </div>
            </div>
        </article>
    );
}

// ---------- Flèches ----------
function ArrowButton({ dir, onClick }: { dir: "left" | "right"; onClick?: () => void }) {
    const isLeft = dir === "left";
    return (
        <button
            aria-label={isLeft ? "Précédent" : "Suivant"}
            onClick={onClick}
            className="absolute z-10 top-1/2 -translate-y-1/2 hidden sm:flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white/90 shadow-md backdrop-blur transition hover:bg-white active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-900/70"
            style={{ [isLeft ? "left" : "right"]: "-0.75rem" } as React.CSSProperties}
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {isLeft ? (
                    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                )}
            </svg>
        </button>
    );
}

// ---------- Composant Principal ----------
export default function OurSelects() {
    const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
        loop: true,
        rubberband: true,
        slides: {
            perView: 6,
            spacing: 16,
        },
        breakpoints: {
            "(max-width: 1536px)": { slides: { perView: 5, spacing: 16 } },
            "(max-width: 1280px)": { slides: { perView: 4, spacing: 14 } },
            "(max-width: 1024px)": { slides: { perView: 3, spacing: 12 } },
            "(max-width: 768px)": { slides: { perView: 2, spacing: 10 } },
            "(max-width: 640px)": { slides: { perView: 1, spacing: 8 } }, // ✅ 1 produit/slide en mobile
        },
    });

    return (
        <section className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            {/* Titre / en-tête */}
            <header className="mb-6 flex items-end justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Nos sélections</p>
                    <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                        Pièces iconiques de la saison
                    </h2>
                </div>
                <div className="hidden gap-3 sm:flex">
                    <ArrowButton dir="left" onClick={() => instanceRef.current?.prev()} />
                    <ArrowButton dir="right" onClick={() => instanceRef.current?.next()} />
                </div>
            </header>

            {/* Carrousel */}
            <div ref={sliderRef} className="keen-slider">
                {PRODUCTS.map((p) => (
                    <div key={p.id} className="keen-slider__slide">
                        <ProductCard p={p} />
                    </div>
                ))}
            </div>

            {/* Contrôles mobiles */}
            <div className="mt-5 flex items-center justify-center gap-3 sm:hidden">
                <button
                    onClick={() => instanceRef.current?.prev()}
                    className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                >
                    Précédent
                </button>
                <button
                    onClick={() => instanceRef.current?.next()}
                    className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                >
                    Suivant
                </button>
            </div>
        </section>
    );
}

/*
// ---------- (Optionnel) Récupération via WooCommerce REST (plus tard) ----------
// Exemple d'esquisse (Server Component ou API Route recommandée pour cacher les clés)
// Docs: https://woocommerce.github.io/woocommerce-rest-api-docs/

// 1) Créez une route API Next.js /app/api/products/route.ts pour proxifier la requête
// import { NextResponse } from "next/server";
// export async function GET() {
//   const url = `${process.env.WC_STORE_URL}/wp-json/wc/v3/products?per_page=24&status=publish`;
//   const res = await fetch(url, {
//     headers: {
//       Authorization: `Basic ${Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString("base64")}`,
//     },
//     cache: "no-store",
//   });
//   const data = await res.json();
//   return NextResponse.json(data);
// }

// 2) Dans OurSelects, remplacez PRODUCTS par des données fetchées (useEffect ou Server Component)
// useEffect(() => { fetch("/api/products").then(r => r.json()).then(setProducts); }, []);
*/

/*
// ---------- Variante sans librairie (scroll-snap) ----------
// Si vous ne voulez aucune dépendance, remplacez le bloc keen-slider par:
// <div className="flex snap-x snap-mandatory overflow-x-auto gap-4">
//   {PRODUCTS.map(p => (
//     <div key={p.id} className="snap-start shrink-0 basis-[85%] sm:basis-[45%] md:basis-[30%] lg:basis-[22%] xl:basis-[18%] 2xl:basis-[16%]">
//       <ProductCard p={p} />
//     </div>
//   ))}
// </div>
*/