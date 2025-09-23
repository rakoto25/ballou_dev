"use client";

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";
import { motion } from "framer-motion";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * UI FALLBACKS (Button/Card) — remplace shadcn si indisponible
 */
function cn(...cls: Array<string | undefined | null | false>) {
    return cls.filter(Boolean).join(" ");
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost" | "link";
    size?: "default" | "icon" | "sm" | "lg";
};

const BTN_VARIANTS: Record<NonNullable<ButtonProps["variant"]>, string> = {
    default: "bg-black text-white hover:opacity-90",
    outline: "border bg-transparent hover:bg-gray-50",
    ghost: "bg-transparent hover:bg-gray-50",
    link: "bg-transparent underline-offset-4 hover:underline",
};

const BTN_SIZES: Record<NonNullable<ButtonProps["size"]>, string> = {
    default: "h-10 px-4",
    icon: "h-10 w-10 p-0",
    sm: "h-9 px-3",
    lg: "h-11 px-6",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "default", size = "default", ...props }, ref) => (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                BTN_VARIANTS[variant],
                BTN_SIZES[size],
                className
            )}
            {...props}
        />
    )
);
Button.displayName = "Button";

function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("rounded-2xl border bg-white shadow-sm", className)} {...props} />;
}
function CardHeader({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-3", className)} {...props} />;
}
function CardTitle({ className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn("text-base font-semibold leading-none tracking-tight", className)} {...props} />;
}
function CardContent({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-3", className)} {...props} />;
}
function CardFooter({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-3 pt-0", className)} {...props} />;
}

/**
 * Product type expected by the component. Adjust to your data model if needed.
 */
export type BestsellerProduct = {
    id: string | number;
    title: string;
    imageUrl: string;
    category?: string;
    price: number;
    currency?: string; // default: MGA
    ref?: string; // internal reference
    href?: string; // product page
};

// ✅ Données statiques pour le slider (utilisées par défaut)
export const STATIC_BESTSELLERS: BestsellerProduct[] = Array.from({ length: 18 }).map(
    (_, i) => ({
        id: i + 1,
        title: `Produit ${i + 1} — Édition limitée`,
        imageUrl: `https://picsum.photos/seed/best-${i + 1}/600/450`,
        category: i % 3 === 0 ? "Électronique" : i % 3 === 1 ? "Accessoires" : "Maison",
        price: 149_000 + i * 5_000,
        currency: "MGA",
        ref: `SKU-${String(i + 1).padStart(4, "0")}`,
        href: `/produits/${String(i + 1).padStart(4, "0")}`,
    })
);

export type BestsellersProps = {
    /** Optionnel pour l'instant. Si non fourni, on affiche STATIC_BESTSELLERS. */
    products?: BestsellerProduct[];
    /** Called when user clicks "Ajouter au panier". */
    onAddToCart?: (product: BestsellerProduct) => void;
    /** Override embla options */
    options?: EmblaOptionsType;
    /** Optional section title */
    title?: string;
    /** Optional subtitle */
    subtitle?: string;
    /** Tailwind classes applied to the root wrapper */
    className?: string;
};

/**
 * Breakpoint-aware group size: 1 (mobile), 3 (md), 6 (lg)
 * ➜ garantit 1 seul produit par slide sur mobile.
 */
function useGroupSize() {
    const [size, setSize] = React.useState(1);
    React.useEffect(() => {
        const mqLg = window.matchMedia("(min-width: 1024px)"); // lg
        const mqMd = window.matchMedia("(min-width: 768px)"); // md
        const update = () => setSize(mqLg.matches ? 6 : mqMd.matches ? 3 : 1);
        update();
        mqLg.addEventListener("change", update);
        mqMd.addEventListener("change", update);
        return () => {
            mqLg.removeEventListener("change", update);
            mqMd.removeEventListener("change", update);
        };
    }, []);
    return size;
}

/** Utility to chunk an array into groups of `size`. */
function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
    return chunks;
}

function formatPrice(value: number, currency = "MGA") {
    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency,
            currencyDisplay: "symbol",
            maximumFractionDigits: currency === "MGA" ? 0 : 2,
        }).format(value);
    } catch {
        return `${value.toLocaleString()} ${currency}`;
    }
}

/**
 * Bestsellers slider component
 * - 1 produit/slide en mobile, 3 en md, 6 en lg
 * - Infinite loop & Autoplay
 */
export default function Bestsellers({
    products,
    onAddToCart,
    options,
    title = "Meilleures ventes",
    subtitle = "Nos produits les plus appréciés",
    className = "",
}: BestsellersProps) {
    const autoplay = React.useRef(
        Autoplay({ delay: 4500, stopOnInteraction: true, stopOnMouseEnter: true })
    );

    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, skipSnaps: false, align: "start", ...options },
        [autoplay.current]
    );

    const groupSize = useGroupSize();

    // ✅ Source de vérité: données passées en props, sinon mock statique
    const data = React.useMemo(
        () => (products && products.length > 0 ? products : STATIC_BESTSELLERS),
        [products]
    );

    const slides = React.useMemo(() => chunkArray(data, groupSize), [data, groupSize]);

    // Re-init Embla si la structure des slides change (resize / breakpoint)
    React.useEffect(() => {
        emblaApi?.reInit();
    }, [emblaApi, groupSize, data.length]);

    const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    // Classes de grille en fonction de groupSize
    const gridCols = groupSize === 6 ? "grid-cols-6" : groupSize === 3 ? "grid-cols-3" : "grid-cols-1";

    return (
        <section className={`w-full py-8 md:py-12 lg:py-16 ${className}`}>
            <div className="mx-auto max-w-[1400px] px-4 md:px-6">
                <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
                        {subtitle ? (
                            <p className="mt-1 text-sm text-muted-foreground md:text-base">{subtitle}</p>
                        ) : null}
                    </div>
                    <div className="hidden items-center gap-2 md:flex">
                        <Button variant="outline" size="icon" aria-label="Précédent" onClick={scrollPrev}>
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button variant="outline" size="icon" aria-label="Suivant" onClick={scrollNext}>
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Embla viewport */}
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex">
                        {slides.map((group, groupIdx) => (
                            <div key={`slide-${groupIdx}`} className="min-w-full shrink-0 px-1 sm:px-2" aria-roledescription="slide">
                                <div className={cn("grid gap-3 sm:gap-4", gridCols)}>
                                    {group.map((p) => (
                                        <motion.article
                                            layout
                                            key={p.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, margin: "-20%" }}
                                        >
                                            <Card className="group h-full overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md">
                                                {p.href ? (
                                                    <a href={p.href} className="block" aria-label={p.title}>
                                                        <div className="relative aspect-[4/3] w-full overflow-hidden">
                                                            <Image
                                                                src={p.imageUrl}
                                                                alt={p.title}
                                                                fill
                                                                sizes="(max-width: 1024px) 90vw, 20vw"
                                                                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                                                priority={groupIdx === 0}
                                                            />
                                                        </div>
                                                    </a>
                                                ) : (
                                                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                                                        <Image
                                                            src={p.imageUrl}
                                                            alt={p.title}
                                                            fill
                                                            sizes="(max-width: 1024px) 90vw, 20vw"
                                                            className="object-cover"
                                                            priority={groupIdx === 0}
                                                        />
                                                    </div>
                                                )}

                                                <CardHeader className="space-y-1 p-3">
                                                    <CardTitle className="line-clamp-2 text-sm font-semibold leading-tight md:text-base">{p.title}</CardTitle>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-[11px] uppercase tracking-wide text-muted-foreground md:text-xs">{p.category ?? ""}</span>
                                                        {p.ref ? (
                                                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">Ref: {p.ref}</span>
                                                        ) : null}
                                                    </div>
                                                </CardHeader>

                                                <CardContent className="p-3 pt-0">
                                                    <p className="text-base font-bold md:text-lg">{formatPrice(p.price, p.currency)}</p>
                                                </CardContent>

                                                <CardFooter className="p-3 pt-0">
                                                    <Button className="w-full" disabled={!onAddToCart} onClick={() => onAddToCart?.(p)}>
                                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                                        Ajouter au panier
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        </motion.article>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile nav */}
                <div className="mt-4 flex items-center justify-center gap-2 md:hidden">
                    <Button variant="outline" size="icon" aria-label="Précédent" onClick={scrollPrev}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="icon" aria-label="Suivant" onClick={scrollNext}>
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </section>
    );
}

/**
 * Example usage:
 * <Bestsellers onAddToCart={(p) => console.log("add:", p)} />
 * // OU avec vos propres données: <Bestsellers products={mesProduits} />
 */

