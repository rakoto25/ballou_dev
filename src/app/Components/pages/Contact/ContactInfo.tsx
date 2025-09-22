"use client";


import React from "react";


export interface ContactInfoItem {
    label: string;
    value: string;
    href?: string; // mailto:, tel:, https:
}


export interface ContactInfoProps {
    items: ContactInfoItem[];
    brandPrimary?: string;
}


export function ContactInfo({ items, brandPrimary = "#e94e1a" }: ContactInfoProps) {
    return (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((it) => (
                    <a
                        key={it.label + it.value}
                        href={it.href ?? "#"}
                        target={it.href?.startsWith("http") ? "_blank" : undefined}
                        rel={it.href?.startsWith("http") ? "noreferrer" : undefined}
                        className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                    >
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            {it.label}
                        </div>
                        <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                            {it.value}
                        </div>
                        <span
                            className="pointer-events-none absolute -right-3 -top-3 h-14 w-14 rounded-full opacity-15"
                            style={{ backgroundColor: brandPrimary }}
                        />
                    </a>
                ))}
            </div>
        </section>
    );
}