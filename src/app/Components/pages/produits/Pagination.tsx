"use client";
import React from "react";

export interface PaginationProps {
    currentPage: number;
    perPage: number;        // 16
    total: number;          // filtered.length
    onPageChange: (page: number) => void;
    brandPrimary?: string;  // #e94e1a
}

export default function Pagination({
    currentPage,
    perPage,
    total,
    onPageChange,
    brandPrimary = "#e94e1a",
}: PaginationProps) {
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    if (totalPages <= 1) return null;

    const styleVar = { ["--brand-primary" as any]: brandPrimary } as React.CSSProperties;

    // Fenêtre de pages (avec ellipses)
    const pages: (number | "…")[] = [];
    const push = (v: number | "…") => pages.push(v);
    const windowSize = 2; // pages de part et d'autre

    push(1);
    const start = Math.max(2, currentPage - windowSize);
    const end = Math.min(totalPages - 1, currentPage + windowSize);
    if (start > 2) push("…");
    for (let p = start; p <= end; p++) push(p);
    if (end < totalPages - 1) push("…");
    if (totalPages > 1) push(totalPages);

    return (
        <nav className="mt-6 flex items-center justify-between gap-3" aria-label="Pagination" style={styleVar}>
            <button
                type="button"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 disabled:opacity-50 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
                ← Précédent
            </button>

            <ul className="flex items-center gap-1">
                {pages.map((p, i) =>
                    p === "…" ? (
                        <li key={`e-${i}`} className="px-2 text-sm text-zinc-500">…</li>
                    ) : (
                        <li key={p}>
                            <button
                                type="button"
                                onClick={() => onPageChange(p)}
                                aria-current={p === currentPage ? "page" : undefined}
                                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${p === currentPage
                                    ? "bg-[var(--brand-primary)] text-white"
                                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                                    }`}
                            >
                                {p}
                            </button>
                        </li>
                    )
                )}
            </ul>

            <button
                type="button"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 disabled:opacity-50 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
                Suivant →
            </button>
        </nav>
    );
}