'use client';

import Link from 'next/link';
type Cat = { label: string; slug: string };
type Props = { categories?: Cat[] };

export default function Hero({ categories = [] }: Props) {
    return (
        <section className="relative overflow-hidden bg-[#29235c] text-white">
            {/* accents doux et épurés */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#e94e1a] opacity-20 blur-3xl" />
                <div className="absolute -left-20 bottom-[-6rem] h-48 w-48 rounded-full bg-white/10 opacity-30 blur-2xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 ring-1 ring-white/15">
                    <span className="inline-block h-2 w-2 rounded-full bg-[#e94e1a]" />
                    Spécialiste d’intérieur
                </span>

                <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white md:text-5xl">
                    Habillez votre intérieur avec sobriété et caractère.
                </h1>

                <p className="mt-4 max-w-2xl text-white/60 md:text-lg">
                    Meubles, literie, tapis, déco et art de la table. Des pièces
                    sélectionnées pour des espaces élégants et fonctionnels.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link
                        href="/nouveautes"
                        className="inline-flex items-center justify-center rounded-full bg-[#e94e1a] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e94e1a]"
                    >
                        Découvrir les nouveautés
                    </Link>
                    <Link
                        href="/categories"
                        className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                    >
                        Voir toutes les catégories
                    </Link>
                </div>

                {/* chips catégories (optionnel, épuré) */}
                {categories.length > 0 && (
                    <nav className="mt-6 flex flex-wrap items-center gap-2">
                        {categories.map((c) => (
                            <Link
                                key={c.slug}
                                href={`/c/${c.slug}`}
                                className="rounded-full bg-white/5 px-3 py-1.5 text-sm text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
                            >
                                {c.label}
                            </Link>
                        ))}
                    </nav>
                )}
            </div>
        </section>
    );
}