"use client";


import React from "react";


export interface HeroContactProps {
    brandPrimary?: string; // default #e94e1a
    brandDark?: string; // default #29235c
    title?: string;
    subtitle?: string;
}


export default function HeroContact({
    brandPrimary = "#e94e1a",
    brandDark = "#29235c",
    title = "Contactez-nous",
    subtitle = "Une question, un projet, un partenariat ? Parlons-en.",
}: HeroContactProps) {
    return (
        <section
            className="relative overflow-hidden"
            style={{
                // Petite gradient propre à la charte
                background: `linear-gradient(135deg, ${brandDark} 0%, ${brandDark} 55%, ${brandPrimary} 100%)`,
            }}
        >
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="relative z-10 max-w-3xl">
                    <p className="mb-3 text-xs uppercase tracking-widest text-white/70">
                        Parlons ensemble
                    </p>
                    <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl">
                        {title}
                    </h1>
                    <p className="mt-4 text-base text-white/85 sm:text-lg">{subtitle}</p>
                </div>


                {/* Décor minimal */}
                <div className="pointer-events-none absolute -right-16 top-0 hidden h-64 w-64 rotate-12 rounded-3xl border border-white/15 sm:block" />
                <div className="pointer-events-none absolute -bottom-10 right-14 hidden h-28 w-28 rounded-3xl border border-white/10 sm:block" />
            </div>
        </section>
    );
}