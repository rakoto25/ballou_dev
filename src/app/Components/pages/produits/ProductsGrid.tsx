"use client";
import React from "react";
import { Product } from "./ProductTypes";
import ProductCard from "./ProductCard";

export default function ProductsGrid({ products }: { products: Product[] }) {
    if (!products.length) {
        return (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                Aucun produit ne correspond à vos filtres.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
                <ProductCard key={p.id} p={p} />
            ))}
        </div>
    );
}