"use client";

import React, { useRef } from "react";
import Link from "next/link";
import type { Product } from "./singleproduct";

type SimilarProps = {
    products: Product[];
    title?: string;
    brandPrimary?: string; // #e94e1a
    brandDark?: string;    // #29235c
};

export default function SimilarProduct({
    products,
    title = "Produits similaires",
    brandPrimary = "#e94e1a",
    brandDark = "#29235c",
}: SimilarProps) {
    const scroller = useRef<HTMLDivElement>(null);

    const scrollBy = (dx: number) => {
        if (!scroller.current) return;
        scroller.current.scrollBy({ left: dx, behavior: "smooth" });
    };

    if (!products?.length) return null;

    return (
        <section className="mt-10">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-extrabold" style={{ color: brandDark }}>
                    {title}
                </h2>
                <div className="hidden gap-2 sm:flex">
                    <button
                        onClick={() => scrollBy(-320)}
                        className="rounded-full border px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
                        style={{ borderColor: "#e5e7eb" }}
                    >
                        ◀
                    </button>
                    <button
                        onClick={() => scrollBy(320)}
                        className="rounded-full border px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
                        style={{ borderColor: "#e5e7eb" }}
                    >
                        ▶
                    </button>
                </div>
            </div>

            <div
                ref={scroller}
                className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
            >
                {products.map((p) => (
                    <article
                        key={p.id}
                        className="min-w-[72%] snap-start rounded-xl border bg-white shadow-sm sm:min-w-[320px]"
                        style={{ borderColor: "#e5e7eb" }}
                    >
                        <Link href={`/produit-unique/${encodeURIComponent(p.slug)}`} className="block">
                            <div className="aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-zinc-100">
                                <img
                                    src={p.images[0]}
                                    alt={p.name}
                                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                            </div>
                            <div className="p-3">
                                <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900">{p.name}</h3>
                                <div className="mt-1 flex items-center gap-2">
                                    <div className="text-base font-extrabold" style={{ color: brandPrimary }}>
                                        {formatEUR(p.price)}
                                    </div>
                                    {!!p.oldPrice && (
                                        <div className="text-xs text-zinc-400 line-through">{formatEUR(p.oldPrice)}</div>
                                    )}
                                </div>
                                {p.rating !== undefined && (
                                    <div className="mt-1 text-xs text-yellow-500">★ {p.rating.toFixed(1)}</div>
                                )}
                            </div>
                        </Link>
                    </article>
                ))}
            </div>
        </section>
    );
}

function formatEUR(v: number) {
    try {
        return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v);
    } catch {
        return `${v.toFixed(2)} €`;
    }
}