"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Product } from "./ProductTypes";
import FiltersSidebar from "./FiltersSidebar";
import ProductsGrid from "./ProductsGrid";
import Pagination from "./Pagination"; // <= nouveau

export interface ProductsClientProps {
    initialProducts: Product[];
    brandPrimary?: string;
    brandDark?: string;
}

const PER_PAGE = 16;

export default function ProductsClient({
    initialProducts,
    brandPrimary = "#e94e1a",
    brandDark = "#29235c",
}: ProductsClientProps) {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const prices = useMemo(() => initialProducts.map((p) => p.priceMGA), [initialProducts]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);

    const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null]);

    // ✅ pagination
    const [page, setPage] = useState(1);

    const categories = useMemo(
        () => Array.from(new Set(initialProducts.map((p) => p.category))).sort(),
        [initialProducts]
    );

    const filtered = useMemo(() => {
        const s = search.trim().toLowerCase();
        return initialProducts.filter((p) => {
            const withinSearch = !s || p.title.toLowerCase().includes(s) || p.ref.toLowerCase().includes(s);
            const withinCat = selected.size === 0 || selected.has(p.category);
            const withinPrice = p.priceMGA >= priceRange[0] && p.priceMGA <= priceRange[1];

            const t = p.createdAt ? new Date(p.createdAt).getTime() : null;
            const fromOk = !dateRange[0] || (t !== null && t >= new Date(dateRange[0]).getTime());
            const toOk = !dateRange[1] || (t !== null && t <= new Date(dateRange[1]).getTime() + 86400000 - 1);
            const withinDate = fromOk && toOk;

            return withinSearch && withinCat && withinPrice && withinDate;
        });
    }, [initialProducts, search, selected, priceRange, dateRange]);

    // 🔄 Reset page à 1 quand les filtres changent
    useEffect(() => {
        setPage(1);
    }, [search, selected, priceRange, dateRange]);

    // Clamp la page si le nb d’items a changé
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const start = (page - 1) * PER_PAGE;
    const paginated = filtered.slice(start, start + PER_PAGE);

    const toggleCategory = (c: string) => {
        const next = new Set(selected);
        if (next.has(c)) next.delete(c);
        else next.add(c);
        setSelected(next);
    };
    const clearCategories = () => setSelected(new Set());

    const styleVar = {
        ["--brand-primary" as any]: brandPrimary,
        ["--brand-dark" as any]: brandDark,
    } as React.CSSProperties;

    return (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" style={styleVar}>
            <header className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-500">Catalogue</p>
                    <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
                        Produits par catégorie
                    </h1>
                    <p className="mt-1 text-xs text-zinc-500">{total} produit(s) — page {page}/{totalPages}</p>
                </div>
                <button
                    onClick={() => {
                        setSearch("");
                        clearCategories();
                        setPriceRange([minPrice, maxPrice]);
                        setDateRange([null, null]);
                        setPage(1);
                    }}
                    className="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                    Réinitialiser filtres
                </button>
            </header>

            {/* 30% / 70% */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(260px,30%)_minmax(0,70%)]">
                <FiltersSidebar
                    search={search}
                    setSearch={setSearch}
                    categories={categories}
                    selected={selected}
                    toggleCategory={toggleCategory}
                    clearCategories={clearCategories}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    brandPrimary={brandPrimary}
                    brandDark={brandDark}
                />

                <div className="space-y-4">
                    {/* Grille paginée */}
                    <ProductsGrid products={paginated} />

                    {/* Pagination */}
                    <Pagination
                        currentPage={page}
                        perPage={PER_PAGE}
                        total={total}
                        onPageChange={setPage}
                        brandPrimary={brandPrimary}
                    />
                </div>
            </div>
        </section>
    );
}