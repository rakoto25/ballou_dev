"use client";
import React from "react";
import { Product, fmtMGA } from "./ProductTypes";


export default function ProductCard({ p }: { p: Product }) {
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