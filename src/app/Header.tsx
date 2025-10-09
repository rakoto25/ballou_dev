'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import CartBadge from './(site)/CartBadge';
import { listCategories, BallouCategory } from '@/lib/ballou';

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [rayonsOpen, setRayonsOpen] = useState(false);
    const [cats, setCats] = useState<BallouCategory[]>([]);
    const [loadingCats, setLoadingCats] = useState(true);
    const [expanded, setExpanded] = useState<Record<number, boolean>>({}); // parentId -> open

    // fetch catégories (parents + enfants)
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoadingCats(true);
                const { items } = await listCategories({ depth: 2, hide_empty: true });

                // Exclure la catégorie "Non classé"
                const filteredItems = items.filter((item) => item.name !== 'Non classé');

                if (alive) setCats(filteredItems);
            } catch (e) {
                console.error('Categories fetch failed', e);
            } finally {
                if (alive) setLoadingCats(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    // body scroll lock quand le panneau est ouvert
    useEffect(() => {
        const el = document.documentElement; // fonctionne mieux que body sur Tailwind
        if (rayonsOpen) el.classList.add('overflow-hidden');
        else el.classList.remove('overflow-hidden');
        return () => el.classList.remove('overflow-hidden');
    }, [rayonsOpen]);

    // fermer à Échap
    useEffect(() => {
        if (!rayonsOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setRayonsOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [rayonsOpen]);

    const top7 = useMemo(() => cats.slice(0, 7), [cats]);
    const restCount = Math.max(0, cats.length - top7.length);

    const toggleParent = (id: number) =>
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

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
                        <label htmlFor="search" className="sr-only">
                            Rechercher un produit
                        </label>
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
                            onClick={() => setMobileOpen((v) => !v)}
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
                            <CartBadge />
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
                        {/* 7 parents max */}
                        {loadingCats ? (
                            <SkeletonChips />
                        ) : (
                            top7.map((c) => (
                                <Link
                                    key={c.id}
                                    href={{ pathname: '/produits', query: { category: c.slug } }}
                                    className="whitespace-nowrap rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#e94e1a]/70"
                                    title={`${c.name} (${c.count})`}
                                >
                                    {c.name}
                                </Link>
                            ))
                        )}

                        {/* Bouton Tous les rayons (avec hamburger) */}
                        {cats.length > 5 && (
                            <button
                                type="button"
                                onClick={() => setRayonsOpen(true)}
                                className="ml-auto inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-[#e94e1a]/70"
                                title={`Voir les ${restCount} autres rayons`}
                            >
                                <MenuIcon className="h-4 w-4 text-white/90" />
                                <span>Tous les rayons</span>
                            </button>
                        )}
                    </nav>
                </div>
                {/* liseré orange en bas */}
                <div className="h-1 w-full bg-[#e94e1a]/80" />
            </div>

            {/* Offcanvas gauche (scrollable) */}
            <Offcanvas open={rayonsOpen} onClose={() => setRayonsOpen(false)}>
                <div className="flex h-full flex-col">
                    {/* header fixe */}
                    <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
                        <div className="inline-flex items-center gap-2">
                            <MenuIcon className="h-4 w-4 text-white/90" />
                            <h3 className="text-base font-semibold text-white">Tous les rayons</h3>
                        </div>
                        <button
                            onClick={() => setRayonsOpen(false)}
                            className="rounded-full p-2 hover:bg-white/10"
                            aria-label="Fermer"
                        >
                            <CloseIcon className="h-5 w-5 text-white/80" />
                        </button>
                    </div>

                    {/* contenu scrollable */}
                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
                        {loadingCats ? (
                            <div className="p-4 text-white/70 text-sm">Chargement…</div>
                        ) : (
                            <ul className="space-y-1">
                                {cats.map((p) => {
                                    const isOpen = !!expanded[p.id];
                                    const hasChildren = !!(p.children && p.children.length > 0);

                                    return (
                                        <li key={p.id} className="rounded-lg">
                                            {/* CAS 1 — parent SANS sous-catégories : on rend la ligne cliquable */}
                                            {!hasChildren ? (
                                                <Link
                                                    href={{ pathname: '/produits', query: { category: p.slug } }}
                                                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/10"
                                                    onClick={() => setRayonsOpen(false)}
                                                >
                                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-xs font-bold">
                                                        {p.count}
                                                    </span>
                                                    <span className="flex-1 text-white">{p.name}</span>
                                                    {/* Pas de chevron car pas de sous-cats */}
                                                </Link>
                                            ) : (
                                                /* CAS 2 — parent AVEC sous-catégories : bouton pour déplier  */
                                                <>
                                                    <button
                                                        onClick={() => toggleParent(p.id)}
                                                        className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-white/10"
                                                        aria-expanded={isOpen}
                                                        aria-controls={`sub-${p.id}`}
                                                    >
                                                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-xs font-bold">
                                                            {p.count}
                                                        </span>
                                                        <span className="flex-1 text-white">{p.name}</span>
                                                        <ChevronIcon
                                                            className={`h-4 w-4 text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''
                                                                }`}
                                                        />
                                                    </button>

                                                    {/* Sous-cats */}
                                                    {isOpen && p.children && p.children.length > 0 && (
                                                        <ul id={`sub-${p.id}`} className="ml-11 mt-1 space-y-1">
                                                            {p.children.map((c) => (
                                                                <li key={c.id}>
                                                                    <Link
                                                                        href={{
                                                                            pathname: '/produits',
                                                                            query: { category: c.slug },
                                                                        }}
                                                                        className="flex items-center gap-2 rounded-md px-3 py-1.5 text-white/90 hover:bg-white/10"
                                                                        onClick={() => setRayonsOpen(false)}
                                                                    >
                                                                        <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-white/10 text-[10px] font-bold">
                                                                            {c.count}
                                                                        </span>
                                                                        <span>{c.name}</span>
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </Offcanvas>
        </header>
    );
}

/* --- Offcanvas composant --- */
function Offcanvas({
    open,
    onClose,
    children,
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}) {
    return (
        <>
            {/* overlay */}
            <div
                className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-[1px] transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                onClick={onClose}
                aria-hidden="true"
            />
            {/* panel */}
            <aside
                className={`fixed left-0 top-0 z-[61] h-screen w-[340px] max-w-[86vw] bg-[#29235c] text-white shadow-xl transition-transform ${open ? 'translate-x-0' : '-translate-x-full'
                    }`}
                role="dialog"
                aria-modal="true"
                aria-label="Menu des catégories"
            >
                {children}
            </aside>
        </>
    );
}

/* --- Skeleton pour les chips --- */
function SkeletonChips() {
    return (
        <>
            {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="h-7 w-24 animate-pulse rounded-full bg-white/10" />
            ))}
        </>
    );
}

/* --- Icônes SVG --- */
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
            <path
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-4.8-4.8m2.3-5.2a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0z"
            />
        </svg>
    );
}
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
            <path strokeWidth="1.8" strokeLinecap="round" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm7 8a7 7 0 0 0-14 0" />
        </svg>
    );
}
function CartIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
            <path
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4h2l2 12h10l2-8H7M9 20a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm10 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
            />
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
function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
            <path strokeWidth="1.8" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
        </svg>
    );
}
function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
            <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
    );
}