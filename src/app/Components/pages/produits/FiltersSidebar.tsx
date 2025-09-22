"use client";
import React, { useEffect, useRef, useState } from "react";

export interface FiltersSidebarProps {
    search: string;
    setSearch: (v: string) => void;

    categories: string[];
    selected: Set<string>;
    toggleCategory: (c: string) => void;
    clearCategories: () => void;

    minPrice: number;
    maxPrice: number;
    priceRange: [number, number];
    setPriceRange: (r: [number, number]) => void;

    dateRange: [string | null, string | null]; // YYYY-MM-DD
    setDateRange: (r: [string | null, string | null]) => void;

    brandPrimary?: string; // #e94e1a
    brandDark?: string;    // #29235c
}

export default function FiltersSidebar({
    search,
    setSearch,
    categories,
    selected,
    toggleCategory,
    clearCategories,
    minPrice,
    maxPrice,
    priceRange,
    setPriceRange,
    dateRange,
    setDateRange,
    brandPrimary = "#e94e1a",
}: FiltersSidebarProps) {
    const [min, max] = priceRange;
    const styleVar = { ["--brand-primary" as any]: brandPrimary } as React.CSSProperties;

    // ✅ Fallback sûr (évite dateRange[0] sur undefined)
    const [from, to] = dateRange ?? [null, null];
    const setDateRangeSafe = (next: [string | null, string | null]) => {
        if (typeof setDateRange === "function") setDateRange(next);
    };

    // Dropdown catégories
    const [openCats, setOpenCats] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!wrapRef.current) return;
            if (!wrapRef.current.contains(e.target as Node)) setOpenCats(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpenCats(false);
        };
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onKey);
        };
    }, []);

    return (
        <aside className="sticky top-20 h-fit rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {/* Recherche + sélecteur Catégories */}
            <div className="mb-6" ref={wrapRef}>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    Recherche / Catégories
                </label>
                <div className="relative">
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => setOpenCats(true)}
                        placeholder="Rechercher un produit…"
                        className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 pr-24 text-sm outline-none ring-[0.5px] ring-transparent transition focus:ring-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                        style={styleVar}
                    />
                    <button
                        type="button"
                        aria-haspopup="listbox"
                        aria-expanded={openCats}
                        onClick={() => setOpenCats((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-3 py-1.5 text-xs font-semibold text-[var(--brand-primary)] hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        style={styleVar}
                    >
                        Catégories
                    </button>

                    {openCats && (
                        <div
                            className="absolute left-0 top-full z-20 mt-2 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                            role="listbox"
                        >
                            <div className="max-h-64 overflow-y-auto p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                                        Sélectionner des catégories
                                    </span>
                                    <button
                                        onClick={() => clearCategories()}
                                        className="text-xs text-[var(--brand-primary)] hover:underline"
                                        style={styleVar}
                                    >
                                        Effacer
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {categories.map((c) => {
                                        const checked = selected.has(c);
                                        return (
                                            <label key={c} className="flex cursor-pointer items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleCategory(c)}
                                                    className="h-4 w-4 rounded border-zinc-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                                                    style={styleVar}
                                                />
                                                <span className="select-none">{c}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-2 border-t border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-950">
                                <button
                                    type="button"
                                    onClick={() => setOpenCats(false)}
                                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {selected.size > 0 && (
                    <p className="mt-1 truncate text-xs text-zinc-500">
                        {selected.size} catégorie(s) sélectionnée(s)
                    </p>
                )}
            </div>

            {/* Prix */}
            <div className="mb-6">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    Prix
                </span>
                <div className="flex items-center gap-2 text-sm">
                    <input
                        type="number"
                        min={minPrice}
                        max={maxPrice}
                        value={min}
                        onChange={(e) => {
                            const v = Math.min(Number(e.target.value || 0), max);
                            setPriceRange([v, max]);
                        }}
                        className="w-24 rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                    />
                    <span>—</span>
                    <input
                        type="number"
                        min={minPrice}
                        max={maxPrice}
                        value={max}
                        onChange={(e) => {
                            const v = Math.max(Number(e.target.value || 0), min);
                            setPriceRange([min, v]);
                        }}
                        className="w-24 rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                    />
                </div>
                <div className="mt-3">
                    <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        value={min}
                        onChange={(e) => setPriceRange([Math.min(Number(e.target.value), max), max])}
                        className="w-full cursor-pointer"
                    />
                    <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        value={max}
                        onChange={(e) => setPriceRange([min, Math.max(Number(e.target.value), min)])}
                        className="-mt-2 w-full cursor-pointer"
                    />
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                        {new Intl.NumberFormat("fr-MG").format(min)} — {new Intl.NumberFormat("fr-MG").format(max)} MGA
                    </div>
                </div>
            </div>

            {/* Date */}
            <div>
                <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    Date
                </span>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="mb-1 block text-xs text-zinc-500">Du</label>
                        <input
                            type="date"
                            value={from ?? ""} // ✅ safe
                            onChange={(e) => setDateRangeSafe([e.target.value || null, to])}
                            className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs text-zinc-500">Au</label>
                        <input
                            type="date"
                            value={to ?? ""} // ✅ safe
                            onChange={(e) => setDateRangeSafe([from, e.target.value || null])}
                            className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                        />
                    </div>
                </div>
            </div>
        </aside>
    );
}