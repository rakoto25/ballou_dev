"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product, fmtMGA, toSlug } from "./ProductTypes";
import { useCart } from "@/app/(site)/CartProvider";

export default function ProductCard({ p }: { p: Product }) {
    const slug = toSlug(p);
    const href = `/produit-unique/${encodeURIComponent(slug)}/`;
    const router = useRouter();

    const { add, lines } =
        useCart?.() || { add: async () => { }, lines: [] as { id: number; qty: number }[] };

    const id = p.id;
    const inCart = useMemo(() => !!lines.find((l) => l.id === id), [lines, id]);
    const [adding, setAdding] = useState(false);

    async function handleAdd(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (!id || adding) return;

        setAdding(true);
        try {
            const prevQty = lines.find((l) => l.id === id)?.qty ?? 0;
            const nextQty = prevQty + 1;
            await add(id, 1);
            await fetch("/api/cart/update", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, qty: nextQty }),
            });
            router.refresh();
        } finally {
            setAdding(false);
        }
    }

    return (
        <article className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white/80 shadow-sm backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60">
            <Link href={href} className="absolute inset-0 z-10" aria-label={`Voir ${p.title}`} />
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
                {/* ✅ Nom complet centré et sans troncature */}
                <h3 className="text-center text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 break-words">
                    {p.title}
                </h3>

                <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
                    Ref. {p.ref}
                </p>

                <div className="mt-1 flex items-center justify-between">
                    <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        {fmtMGA(p.priceMGA)}
                    </span>

                    {!inCart ? (
                        <button
                            type="button"
                            className="z-20 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 active:scale-[0.98] disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                            onClick={handleAdd}
                            disabled={adding}
                            aria-disabled={adding}
                            title={adding ? "Ajout en cours…" : "Ajouter au panier"}
                        >
                            {adding ? "Ajout…" : "Ajouter"}
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="z-20 px-3 py-1.5 text-xs font-semibold rounded-xl transition active:scale-[0.98]"
                            style={{
                                backgroundColor: "rgba(41,35,92,0.12)",
                                color: "#29235c",
                                border: "1px solid rgba(41,35,92,0.35)",
                            }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                router.push("/panier");
                            }}
                            aria-label="Voir le panier"
                            title="Voir le panier"
                        >
                            Voir
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}