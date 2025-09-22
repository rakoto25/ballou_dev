'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

type Cat = { label: string; slug: string };

const CATEGORIES: Cat[] = [
    { label: 'Meubles', slug: 'meubles' },
    { label: 'Literie', slug: 'literie' },
    { label: 'Tapis & Paillassons', slug: 'tapis-paillassons' },
    { label: 'Décorations', slug: 'decorations' },
    { label: 'Art de la table', slug: 'art-de-la-table' },
    { label: 'Petit électroménager', slug: 'petit-electromenager' },
    { label: 'Ustensiles de cuisine', slug: 'ustensiles-de-cuisine' }
];

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50">
            {/* ÉTAGE 1 — barre principale */}
            <div className="bg-[#29235c] text-white/60 shadow-[inset_0_-1px_0_rgba(255,255,255,.08)]">
                <div className="mx-auto flex h-18 max-w-7xl items-center gap-4 px-4 py-2 md:h-20">
                    {/* Logo */}
                    <Link href="/" className="shrink-0 inline-flex items-center">
                        <Image
                            src="/brand/logo-Ballou-update.png"
                            alt="ballou — Spécialiste d’intérieur"
                            width={160}
                            height={40}
                            priority
                            className="h-9 w-auto md:h-10"
                        />
                    </Link>

                    {/* Recherche (desktop) */}
                    <form action="/recherche" method="GET" className="hidden md:flex flex-1">
                        <label htmlFor="search" className="sr-only">Rechercher un produit</label>
                        <div className="flex w-full items-center rounded-full bg-white/10 ring-1 ring-white/15 transition focus-within:bg-white/15 focus-within:ring-2 focus-within:ring-[#e94e1a]/80">
                            <input
                                id="search"
                                name="q"
                                type="search"
                                placeholder="Rechercher un produit"
                                className="w-full bg-transparent px-5 py-2.5 text-white placeholder-white/60 outline-none"
                            />
                            <button
                                type="submit"
                                aria-label="Rechercher"
                                className="m-1 inline-flex items-center rounded-full p-2.5 hover:bg-white/10 active:scale-[.98] focus:outline-none"
                            >
                                <SearchIcon className="h-5 w-5 text-white/80" />
                            </button>
                        </div>
                    </form>

                    {/* Icônes / actions */}
                    <div className="ml-auto flex items-center gap-1">
                        {/* Menu mobile */}
                        <button
                            className="md:hidden inline-flex items-center rounded-full p-2 hover:bg-white/10"
                            aria-label="Ouvrir le menu"
                            onClick={() => setMobileOpen(v => !v)}
                        >
                            <MenuIcon className="h-6 w-6 text-white/80" />
                        </button>

                        <Link
                            href="/mon-compte"
                            className="hidden sm:inline-flex items-center gap-2 rounded-full px-3 py-2 hover:bg-white/10 hover:text-white transition"
                        >
                            <UserIcon className="h-5 w-5 text-white/80 group-hover:text-white" />
                            <span>Mon compte</span>
                        </Link>

                        <Link
                            href="/panier"
                            className="relative inline-flex items-center gap-2 rounded-full px-3 py-2 hover:bg-white/10 hover:text-white transition"
                        >
                            <CartIcon className="h-5 w-5 text-white/80" />
                            <span className="hidden sm:inline">Panier</span>
                            {/* pastille quantité */}
                            <span className="absolute -right-1 -top-1 rounded-full bg-[#e94e1a] px-1.5 text-[10px] font-bold text-white">
                                0
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Recherche — mobile */}
                {mobileOpen && (
                    <div className="md:hidden px-4 pb-3">
                        <form action="/recherche" method="GET">
                            <div className="flex items-center rounded-full bg-white/10 ring-1 ring-white/15 transition focus-within:bg-white/15 focus-within:ring-2 focus-within:ring-[#e94e1a]/80">
                                <input
                                    name="q"
                                    type="search"
                                    placeholder="Rechercher…"
                                    className="w-full bg-transparent px-4 py-2 text-white placeholder-white/60 outline-none"
                                />
                                <button type="submit" className="m-1 rounded-full p-2 hover:bg-white/10">
                                    <SearchIcon className="h-5 w-5 text-white/80" />
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* ÉTAGE 2 — catégories */}
            <div className="bg-[#29235c] text-white/80 ring-1 ring-black/5">
                <div className="mx-auto max-w-7xl px-4">
                    <nav className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
                        {/* Chip "Toutes les catégories" avec accent orange */}
                        <span className="mr-1 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white/10 px-3 py-1.5 text-white">
                            <span className="inline-block h-2 w-2 rounded-full bg-[#e94e1a]" />
                            Toutes les catégories
                        </span>

                        {CATEGORIES.map((c) => (
                            <Link
                                key={c.slug}
                                href={`/c/${c.slug}`}
                                className="whitespace-nowrap rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#e94e1a]/70"
                            >
                                {c.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                {/* liseré orange en bas pour le rythme */}
                <div className="h-1 w-full bg-[#e94e1a]/80" />
            </div>
        </header>
    );
}

/* --- Icônes SVG (sans dépendances) --- */
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
            <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                d="m21 21-4.8-4.8m2.3-5.2a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0z" />
        </svg>
    );
}
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
            <path strokeWidth="1.8" strokeLinecap="round"
                d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm7 8a7 7 0 0 0-14 0" />
        </svg>
    );
}
function CartIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
            <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                d="M3 4h2l2 12h10l2-8H7M9 20a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm10 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
        </svg>
    );
}
function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
            <path strokeWidth="1.8" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    );
}