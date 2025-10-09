"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

import { listProducts, BallouProduct, priceToNumber } from "@/lib/ballou";
import { useCart } from "@/app/(site)/CartProvider";

/* --------------------------------
   Types & utils
----------------------------------*/
type Product = {
    id: number;
    title: string;
    category?: string;
    price: number;
    currency: string;
    ref?: string;
    img: string;
    href: string;
};

function formatPrice(value: number, currency = "MGA") {
    const zero = new Set([
        "MGA", "JPY", "KRW", "VND", "CLP", "XOF", "XAF", "KMF",
        "PYG", "RWF", "UGX", "VUV", "XPF", "ISK", "HUF", "BIF", "DJF", "GNF",
    ]).has((currency || "").toUpperCase());
    try {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: currency || "MGA",
            maximumFractionDigits: zero ? 0 : 2,
            minimumFractionDigits: zero ? 0 : 2,
        }).format(value);
    } catch {
        return `${Math.round(value).toLocaleString("fr-FR")} ${currency || "MGA"}`;
    }
}

/* --------------------------------
   Carte produit (NO nested <a>)
----------------------------------*/
function ProductCard({
    p,
    onAdd,
    inCart,
}: {
    p: Product;
    onAdd: (p: Product) => void;
    inCart: boolean;
}) {
    const router = useRouter();

    return (
        <article className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white/80 shadow-sm backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="relative aspect-[4/5] w-full overflow-hidden">
                {/* Lien vers la page produit SUR l’image uniquement */}
                <Link href={p.href} aria-label={p.title} className="absolute inset-0 block">
                    <Image
                        src={p.img || "/placeholder.png"}
                        alt={p.title}
                        fill
                        sizes="(min-width: 1024px) 18vw, (min-width: 768px) 44vw, 90vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority={false}
                    />
                </Link>
                {p.category ? (
                    <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/75 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                        {p.category}
                    </span>
                ) : null}
            </div>

            <div className="flex flex-col gap-2 p-4">
                {/* Titre cliquable vers le produit */}
                <h3 className="line-clamp-1 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    <Link href={p.href} className="hover:underline">
                        {p.title}
                    </Link>
                </h3>

                {p.ref ? (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Ref. {p.ref}</p>
                ) : (
                    <div className="h-4" />
                )}

                <div className="mt-1 flex items-center justify-between">
                    <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        {formatPrice(p.price, p.currency)}
                    </span>

                    {inCart ? (
                        // bouton navigation (plus de <a> ici)
                        <button
                            type="button"
                            onClick={() => router.push("/panier")}
                            className="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 active:scale-[0.98] dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                        >
                            Voir
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 active:scale-[0.98] dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                            onClick={() => onAdd(p)}
                        >
                            Ajouter
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

/* --------------------------------
   Flèches
----------------------------------*/
function ArrowButton({
    dir,
    onClick,
}: {
    dir: "left" | "right";
    onClick?: () => void;
}) {
    const isLeft = dir === "left";
    return (
        <button
            aria-label={isLeft ? "Précédent" : "Suivant"}
            onClick={onClick}
            className="absolute z-10 top-1/2 -translate-y-1/2 hidden sm:flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white/90 shadow-md backdrop-blur transition hover:bg-white active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-900/70"
            style={{ [isLeft ? "left" : "right"]: "-0.75rem" } as React.CSSProperties}
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                {isLeft ? (
                    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                )}
            </svg>
        </button>
    );
}

/* --------------------------------
   Composant principal (Keen + fetch Woo + panier)
----------------------------------*/
export default function BestsellersKeen({
    title = "Nos sélections",
    subtitle = "Pièces iconiques de la saison",
    query,
}: {
    title?: string;
    subtitle?: string;
    query?: Record<string, string | number | boolean>;
}) {
    const { add, lines } = useCart();
    const inCart = React.useCallback(
        (pid: number) => lines.some((l) => l.id === pid),
        [lines]
    );
    const onAdd = React.useCallback((p: Product) => add(Number(p.id), 1), [add]);

    const [items, setItems] = React.useState<Product[]>([]);
    const [loading, setLoading] = React.useState(true);

    // Rendu client only (évite flash SSR)
    const [isClient, setIsClient] = React.useState(false);
    React.useEffect(() => setIsClient(true), []);

    // Fetch produits
    React.useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                const params = { per_page: 30, ...(query || {}) };
                const res = await listProducts(params);
                const src = Array.isArray((res as any)?.items)
                    ? ((res as any).items as BallouProduct[])
                    : [];
                const mapped: Product[] = src.map((p) => ({
                    id: Number(p.id),
                    title: p.name,
                    category: p.categories?.[0]?.name || "",
                    price: priceToNumber(p.sale ?? p.price ?? p.regular ?? "0", p.currency),
                    currency: (p.currency || "MGA").toUpperCase(),
                    ref: p.sku || undefined,
                    img: p.images?.[0]?.src || "/placeholder.png",
                    href: `/produit-unique/${encodeURIComponent(p.slug)}/`,
                }));
                if (alive) setItems(mapped);
            } catch (e) {
                console.error("BestsellersKeen fetch failed:", e);
                if (alive) setItems([]);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(query)]);

    // Déterminer combien afficher dans le "preview grid" (avant Keen)
    const [initialPerView, setInitialPerView] = React.useState(5);
    React.useEffect(() => {
        if (typeof window === "undefined") return;
        const compute = () => {
            if (window.matchMedia("(max-width: 640px)").matches) return 1;
            if (window.matchMedia("(max-width: 768px)").matches) return 2;
            if (window.matchMedia("(max-width: 1024px)").matches) return 3;
            return 5;
        };
        setInitialPerView(compute());
        const onResize = () => setInitialPerView(compute());
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // Keen slider setup
    const [sliderReady, setSliderReady] = React.useState(false);
    const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
        {
            loop: true,
            rubberband: true,
            mode: "snap",
            slides: { perView: 5, spacing: 16 }, // 5 visibles desktop
            breakpoints: {
                "(max-width: 1024px)": { slides: { perView: 3, spacing: 12 } },
                "(max-width: 768px)": { slides: { perView: 2, spacing: 10 } },
                "(max-width: 640px)": { slides: { perView: 1, spacing: 8 } }, // 1 mobile
            },
            created() {
                setSliderReady(true); // ⬅️ quand Keen est prêt, on affiche le slider
            },
        },
        [
            // plugin: faire un update sur resize / data changes
            (slider) => {
                const onResize = () => slider.update();
                window.addEventListener("resize", onResize);
                return () => window.removeEventListener("resize", onResize);
            },
        ]
    );

    // Autoplay (pause au survol)
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    React.useEffect(() => {
        const slider = instanceRef.current;
        if (!slider) return;
        let timer: any;
        const next = () => slider.next();
        const play = () => {
            clearInterval(timer);
            timer = setInterval(next, 4500);
        };
        const stop = () => {
            clearInterval(timer);
            timer = null;
        };
        play();
        const el = containerRef.current;
        const onEnter = () => stop();
        const onLeave = () => play();
        el?.addEventListener("mouseenter", onEnter);
        el?.addEventListener("mouseleave", onLeave);
        return () => {
            stop();
            el?.removeEventListener("mouseenter", onEnter);
            el?.removeEventListener("mouseleave", onLeave);
        };
    }, [instanceRef]);

    // ---------- RENDER ----------
    return (
        <section ref={containerRef} className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            {/* Titre */}
            <header className="mb-6 flex items-end justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{subtitle}</p>
                    <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                        {title}
                    </h2>
                </div>
                <div className="hidden gap-3 sm:flex">
                    <ArrowButton dir="left" onClick={() => instanceRef.current?.prev()} />
                    <ArrowButton dir="right" onClick={() => instanceRef.current?.next()} />
                </div>
            </header>

            {/* 1) SSR ou chargement -> squelette grid (jamais 30 items) */}
            {!isClient || loading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={`ssr-sk-${i}`} className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                            <div className="aspect-[4/5] w-full animate-pulse bg-zinc-100 dark:bg-zinc-800" />
                            <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                            <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {/* 2) Preview grid (juste les N premiers) tant que Keen n'est pas ready */}
                    {!sliderReady && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                            {items.slice(0, initialPerView).map((p) => (
                                <ProductCard key={`preview-${p.id}`} p={p} onAdd={(x) => onAdd(x)} inCart={inCart(p.id)} />
                            ))}
                        </div>
                    )}

                    {/* 3) Slider Keen (caché tant que non prêt) */}
                    <div ref={sliderRef} className={`keen-slider ${sliderReady ? "" : "hidden"}`}>
                        {items.map((p) => (
                            <div key={p.id} className="keen-slider__slide">
                                <ProductCard p={p} onAdd={(x) => onAdd(x)} inCart={inCart(p.id)} />
                            </div>
                        ))}
                    </div>
                </>
            )}

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