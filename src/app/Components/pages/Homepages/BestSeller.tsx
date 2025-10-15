"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

import { fetchBestSellersLite } from "@/lib/ballou";
import { useCart } from "@/app/(site)/CartProvider";

type Product = {
    id: number;
    title: string;
    price: number;
    currency: string;
    img: string;
    href: string;
};

const fmt = (v: number, cur = "MGA") => {
    const zero = new Set(["MGA", "JPY", "KRW", "VND", "CLP", "XOF", "XAF", "KMF", "PYG", "RWF", "UGX", "VUV", "XPF", "ISK", "HUF", "BIF", "DJF", "GNF"]).has(cur.toUpperCase());
    try {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency", currency: cur, maximumFractionDigits: zero ? 0 : 2, minimumFractionDigits: zero ? 0 : 2,
        }).format(v);
    } catch {
        return `${Math.round(v).toLocaleString("fr-FR")} ${cur}`;
    }
};

function Card({ p, onAdd, inCart }: { p: Product; onAdd: (p: Product) => void; inCart: boolean }) {
    const router = useRouter();
    return (
        <article className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white/80 shadow-sm backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Link href={p.href} className="absolute inset-0 block" aria-label={p.title}>
                    <Image src={p.img || "/placeholder.png"} alt={p.title} fill sizes="(min-width:1024px)18vw,(min-width:768px)44vw,90vw" className="object-cover transition duration-500 group-hover:scale-105" />
                </Link>
            </div>
            <div className="flex flex-col gap-2 p-4">
                <h3 className="line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    <Link href={p.href} className="hover:underline">{p.title}</Link>
                </h3>
                <div className="mt-1 flex items-center justify-between">
                    <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">{fmt(p.price, p.currency)}</span>
                    {inCart ? (
                        <button type="button" onClick={() => router.push("/panier")} className="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold hover:bg-zinc-100 active:scale-95 dark:border-zinc-700">
                            Voir
                        </button>
                    ) : (
                        <button type="button" onClick={() => onAdd(p)} className="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold hover:bg-zinc-100 active:scale-95 dark:border-zinc-700">
                            Ajouter
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

function Arrow({ dir, onClick, disabled }: { dir: "left" | "right"; onClick?: () => void; disabled?: boolean }) {
    const isLeft = dir === "left";
    return (
        <button
            aria-label={isLeft ? "Précédent" : "Suivant"}
            disabled={!!disabled}
            onClick={disabled ? undefined : onClick}
            className={`absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white/90 shadow-md backdrop-blur transition active:scale-95 dark:border-zinc-700 dark:bg-zinc-900/70 sm:flex ${disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-white"}`}
            style={{ [isLeft ? "left" : "right"]: "-0.75rem" } as React.CSSProperties}
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                {isLeft
                    ? <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    : <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
            </svg>
        </button>
    );
}

export default function Bestsellers({
    title = "Nos meilleures ventes",
    subtitle = "Pièces plébiscitées par nos clients",
    limit = 12,
    days = 30,
    category,
    includeVariations = false,
}: { title?: string; subtitle?: string; limit?: number; days?: number; category?: string; includeVariations?: boolean }) {
    const { add, lines } = useCart();
    const inCart = React.useCallback((id: number) => lines.some(l => l.id === id), [lines]);
    const onAdd = React.useCallback((p: Product) => add(Number(p.id), 1), [add]);

    const [items, setItems] = React.useState<Product[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isClient, setIsClient] = React.useState(false);
    React.useEffect(() => setIsClient(true), []);

    React.useEffect(() => {
        let ok = true;
        (async () => {
            try {
                setLoading(true);
                const rows = await fetchBestSellersLite({ limit, days, category, include_variations: includeVariations });
                const mapped: Product[] = rows.map(r => ({
                    id: Number(r.id), title: r.title, price: r.price, currency: "MGA",
                    img: r.image || "/placeholder.png", href: `/produit-unique/${encodeURIComponent(r.slug)}/`,
                }));
                if (ok) setItems(mapped);
            } catch (e) {
                console.error(e);
                if (ok) setItems([]);
            } finally {
                if (ok) setLoading(false);
            }
        })();
        return () => { ok = false; };
    }, [limit, days, category, includeVariations]);

    // perView responsive
    const [perView, setPerView] = React.useState(5);
    React.useEffect(() => {
        if (typeof window === "undefined") return;
        const calc = () => {
            if (matchMedia("(max-width: 640px)").matches) return 1;
            if (matchMedia("(max-width: 768px)").matches) return 2;
            if (matchMedia("(max-width: 1024px)").matches) return 3;
            return 5;
        };
        setPerView(calc());
        const onResize = () => setPerView(calc());
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // Always init slider when items > 0 (évite la “double ligne”)
    const sliderOn = isClient && items.length > 0;
    const [ready, setReady] = React.useState(false);
    const [sliderRef, instRef] = useKeenSlider<HTMLDivElement>(
        sliderOn ? {
            loop: items.length > perView,
            rubberband: true,
            mode: "snap",
            slides: { perView, spacing: 16 },
            breakpoints: {
                "(max-width: 1024px)": { slides: { perView: 3, spacing: 12 } },
                "(max-width: 768px)": { slides: { perView: 2, spacing: 10 } },
                "(max-width: 640px)": { slides: { perView: 1, spacing: 8 } },
            },
            created() { setReady(true); },
            updated() { setReady(true); },
            destroyed() { setReady(false); },
        } : undefined,
        [(s) => { const onR = () => s.update(); window.addEventListener("resize", onR); return () => window.removeEventListener("resize", onR); }]
    );

    // Autoplay uniquement si on peut slider
    const boxRef = React.useRef<HTMLDivElement | null>(null);
    React.useEffect(() => {
        const k = instRef.current;
        if (!k || items.length <= perView) return;
        let t: any;
        const play = () => { clearInterval(t); t = setInterval(() => k.next(), 4500); };
        const stop = () => { clearInterval(t); t = null; };
        play();
        const el = boxRef.current;
        const enter = () => stop();
        const leave = () => play();
        el?.addEventListener("mouseenter", enter);
        el?.addEventListener("mouseleave", leave);
        return () => { stop(); el?.removeEventListener("mouseenter", enter); el?.removeEventListener("mouseleave", leave); };
    }, [instRef, items.length, perView]);

    const canSlide = ready && !!instRef.current && items.length > 1;

    return (
        <section ref={boxRef} className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <header className="mb-6 flex items-end justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{subtitle}</p>
                    <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                        {title}
                    </h2>
                </div>
                <div className={`gap-3 sm:flex ${canSlide ? "" : "hidden"}`}>
                    <Arrow dir="left" disabled={!canSlide} onClick={() => canSlide && instRef.current!.prev()} />
                    <Arrow dir="right" disabled={!canSlide} onClick={() => canSlide && instRef.current!.next()} />
                </div>
            </header>

            {/* Skeleton / vide */}
            {!isClient || loading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                            <div className="aspect-[4/5] w-full animate-pulse bg-zinc-100 dark:bg-zinc-800" />
                            <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                            <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                        </div>
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="rounded-xl border border-zinc-200 p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
                    Aucune sélection pour le moment.
                </div>
            ) : (
                <div ref={sliderRef} className="keen-slider">
                    {items.map((p) => (
                        <div key={p.id} className="keen-slider__slide">
                            <Card p={p} onAdd={onAdd} inCart={inCart(p.id)} />
                        </div>
                    ))}
                </div>
            )}

            {/* Contrôles mobiles */}
            <div className="mt-5 flex items-center justify-center gap-3 sm:hidden">
                <button
                    disabled={!canSlide}
                    onClick={() => canSlide && instRef.current!.prev()}
                    className={`rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium dark:border-zinc-700 ${canSlide ? "text-zinc-700 dark:text-zinc-200" : "text-zinc-400 cursor-not-allowed"}`}
                >
                    Précédent
                </button>
                <button
                    disabled={!canSlide}
                    onClick={() => canSlide && instRef.current!.next()}
                    className={`rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium dark:border-zinc-700 ${canSlide ? "text-zinc-700 dark:text-zinc-200" : "text-zinc-400 cursor-not-allowed"}`}
                >
                    Suivant
                </button>
            </div>
        </section>
    );
}