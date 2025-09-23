"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

// Couleurs Ballou
const BRAND_PRIMARY = "#e94e1a";
const BRAND_DARK = "#29235c";

export type Product = {
    id: string;
    slug: string;
    name: string;
    price: number;
    oldPrice?: number;
    rating?: number; // 0..5
    images: string[];
    description?: string;
    specs?: { label: string; value: string }[];
    tags?: string[];
    category?: string;
};

type SingleProductProps = {
    product: Product;
    brandPrimary?: string; // #e94e1a
    brandDark?: string;    // #29235c
};

export default function SingleProduct({
    product,
    brandPrimary = BRAND_PRIMARY,
    brandDark = BRAND_DARK,
}: SingleProductProps) {
    const [current, setCurrent] = useState(0);
    const [qty, setQty] = useState(1);

    const mainImg = useMemo(() => product.images[current] ?? product.images[0], [product.images, current]);

    return (
        <section
            className="rounded-2xl border p-4 sm:p-6 lg:p-8 bg-white shadow-sm"
            style={{ borderColor: "#e5e7eb" }}
        >
            {/* Fil d’Ariane */}
            <nav className="mb-6 text-sm text-zinc-500">
                <ol className="flex items-center gap-2">
                    <li>
                        <Link href="/" className="hover:text-[var(--brand-primary)]" style={{ ["--brand-primary" as any]: brandPrimary }}>
                            Accueil
                        </Link>
                    </li>
                    <li>/</li>
                    {product.category ? (
                        <>
                            <li>
                                <Link href={`/categorie/${encodeURIComponent(product.category)}`} className="hover:text-[var(--brand-primary)]" style={{ ["--brand-primary" as any]: brandPrimary }}>
                                    {product.category}
                                </Link>
                            </li>
                            <li>/</li>
                        </>
                    ) : null}
                    <li className="text-zinc-800">{product.name}</li>
                </ol>
            </nav>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Galerie images */}
                <div className="flex flex-col gap-3">
                    <div className="aspect-square w-full overflow-hidden rounded-xl bg-zinc-100">
                        <img
                            src={mainImg}
                            alt={product.name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    {product.images.length > 1 && (
                        <div className="grid grid-cols-5 gap-2">
                            {product.images.map((src, idx) => (
                                <button
                                    key={src + idx}
                                    onClick={() => setCurrent(idx)}
                                    className={`aspect-square overflow-hidden rounded-lg border transition ${idx === current ? "ring-2 ring-offset-2" : "opacity-80 hover:opacity-100"}`}
                                    style={{
                                        borderColor: idx === current ? brandPrimary : "#e5e7eb",
                                        boxShadow: idx === current ? `0 0 0 1px ${brandPrimary}` : undefined,
                                        outline: "none",
                                    }}
                                    aria-label={`Aperçu ${idx + 1}`}
                                >
                                    <img src={src} alt={`${product.name} ${idx + 1}`} className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Infos produit */}
                <div className="flex flex-col gap-5">
                    <div>
                        <h1 className="text-2xl font-extrabold text-zinc-900">{product.name}</h1>
                        {/* Note */}
                        {typeof product.rating === "number" && (
                            <div className="mt-1 flex items-center gap-2">
                                <Stars value={product.rating} />
                                <span className="text-sm text-zinc-500">{product.rating.toFixed(1)} / 5</span>
                            </div>
                        )}
                    </div>

                    {/* Prix */}
                    <div className="flex items-end gap-3">
                        <div className="text-3xl font-black" style={{ color: brandPrimary }}>
                            {formatEUR(product.price)}
                        </div>
                        {!!product.oldPrice && (
                            <div className="text-lg font-semibold text-zinc-400 line-through">
                                {formatEUR(product.oldPrice)}
                            </div>
                        )}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center rounded-full border px-3 py-1.5 text-sm">
                            <button
                                className="px-2 text-zinc-600 hover:text-zinc-900"
                                onClick={() => setQty((q) => Math.max(1, q - 1))}
                            >
                                −
                            </button>
                            <input
                                type="number"
                                className="w-12 border-0 bg-transparent text-center font-semibold outline-none"
                                value={qty}
                                min={1}
                                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value || "1", 10)))}
                            />
                            <button
                                className="px-2 text-zinc-600 hover:text-zinc-900"
                                onClick={() => setQty((q) => q + 1)}
                            >
                                +
                            </button>
                        </div>

                        {/* Bouton Ajouter au panier – pill, rouge transparent */}
                        <button
                            className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            style={{
                                background: "rgba(233,78,26,.40)",             // #e94e1a à 40%
                                border: "1px solid rgba(233,78,26,.55)",
                                boxShadow: "0 6px 14px rgba(233,78,26,.20)",
                            }}
                            onClick={() => alert(`(demo) Ajouté ${qty}× ${product.name}`)}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-90">
                                <path d="M6 6h15l-1.5 9h-12L6 6Z" stroke="currentColor" strokeWidth="2" />
                                <circle cx="9" cy="21" r="1" fill="currentColor" />
                                <circle cx="18" cy="21" r="1" fill="currentColor" />
                            </svg>
                            Ajouter au panier
                        </button>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div className="prose max-w-none prose-zinc">
                            <h3 className="mb-2 text-lg font-semibold" style={{ color: brandDark }}>Description</h3>
                            <p className="text-zinc-700">{product.description}</p>
                        </div>
                    )}

                    {/* Spécifications */}
                    {!!product.specs?.length && (
                        <div>
                            <h3 className="mb-2 text-lg font-semibold" style={{ color: brandDark }}>Spécifications</h3>
                            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                                {product.specs!.map((s) => (
                                    <div key={s.label} className="flex gap-2 text-sm">
                                        <dt className="w-32 text-zinc-500">{s.label}</dt>
                                        <dd className="font-medium text-zinc-800">{s.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    )}

                    {/* Tags */}
                    {!!product.tags?.length && (
                        <div className="flex flex-wrap items-center gap-2">
                            {product.tags!.map((t) => (
                                <span
                                    key={t}
                                    className="rounded-full px-3 py-1 text-xs font-semibold"
                                    style={{
                                        background: "rgba(41,35,92,.08)",
                                        color: brandDark,
                                        border: `1px solid ${brandDark}22`,
                                    }}
                                >
                                    #{t}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
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

function Stars({ value = 0 }: { value?: number }) {
    const full = Math.floor(value);
    const half = value - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
        <div className="flex items-center text-yellow-500">
            {"★".repeat(full)}
            {half ? "☆" : ""}
            {"☆".repeat(empty)}
        </div>
    );
}