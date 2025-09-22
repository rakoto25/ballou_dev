"use client";

import React, { useState } from "react";

export interface ContactFormProps {
    brandPrimary?: string; // ex: "#e94e1a"
    brandDark?: string;    // ex: "#29235c"
}

export default function ContactForm({
    brandPrimary = "#e94e1a",
    brandDark = "#29235c",
}: ContactFormProps) {
    const [status, setStatus] = useState<"idle" | "sent">("idle");

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        // TODO: remplacer par un fetch('/api/contact', { method: 'POST', body: ... })
        setStatus("sent");
    }

    // Déclare la variable CSS de façon type-safe (évite @ts-ignore en inline)
    const styleVar = { ["--brand-primary" as any]: brandPrimary } as React.CSSProperties;

    return (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Colonne gauche : formulaire */}
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                        Envoyez-nous un message
                    </h2>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        Remplissez le formulaire, nous revenons vers vous rapidement.
                    </p>

                    <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Nom complet
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-[0.5px] ring-transparent transition focus:ring-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                                    style={styleVar}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Téléphone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-[0.5px] ring-transparent transition focus:ring-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                                    style={styleVar}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-[0.5px] ring-transparent transition focus:ring-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                                    style={styleVar}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Sujet
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-[0.5px] ring-transparent transition focus:ring-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                                    style={styleVar}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Message
                            </label>
                            <textarea
                                name="message"
                                rows={5}
                                required
                                className="w-full resize-y rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-[0.5px] ring-transparent transition focus:ring-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                                style={styleVar}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-xs text-zinc-500">
                                En envoyant, vous acceptez notre{" "}
                                <a href="/cgv" className="underline">
                                    politique
                                </a>
                                .
                            </p>
                            <button
                                type="submit"
                                className="rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 active:scale-[0.98]"
                                style={styleVar}
                            >
                                Envoyer
                            </button>
                        </div>

                        {status === "sent" && (
                            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                                Merci ! Votre message a été envoyé (simulation).
                            </div>
                        )}
                    </form>
                </div>

                {/* Colonne droite : informations (miroir côté formulaire) */}
                <div
                    className="rounded-3xl border p-6 text-white shadow-sm"
                    style={{ background: brandDark, borderColor: "#ffffff1a" }}
                >
                    <h3 className="text-lg font-extrabold">Informations</h3>
                    <ul className="mt-4 space-y-3 text-sm">
                        <li>
                            <span className="font-semibold">Téléphone:</span>{" "}
                            <a
                                href="tel:+2610000000"
                                className="underline decoration-white/30 underline-offset-4"
                            >
                                +261 00 000 00
                            </a>
                        </li>
                        <li>
                            <span className="font-semibold">Email:</span>{" "}
                            <a
                                href="mailto:contact@ballou.com"
                                className="underline decoration-white/30 underline-offset-4"
                            >
                                contact@ballou.com
                            </a>
                        </li>
                        <li>
                            <span className="font-semibold">Adresse:</span> Rue Exemple,
                            Antananarivo, Madagascar
                        </li>
                        <li>
                            <span className="font-semibold">Facebook:</span>{" "}
                            <a
                                href="https://facebook.com/ballou"
                                target="_blank"
                                rel="noreferrer"
                                className="underline decoration-white/30 underline-offset-4"
                            >
                                facebook.com/ballou
                            </a>
                        </li>
                    </ul>

                    <div className="mt-6 rounded-xl bg-white/10 p-4 text-sm">
                        Besoin d'un rendez-vous ? Indiquez-le dans le message et nous vous
                        recontactons.
                    </div>
                </div>
            </div>
        </section>
    );
}