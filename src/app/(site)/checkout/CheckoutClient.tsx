"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/(site)/CartProvider";
import type { BallouProduct } from "@/lib/ballou";
import { pickUnitPrice } from "@/lib/ballou";

type Line = { id: number; qty: number };

type CheckoutOptions = {
    payments: { id: string; title: string; description?: string; enabled: boolean }[];
    shipping_methods: { id: string; label: string; cost: number; tax: number; total: number }[];
    currency: string; // "MGA"
};

type CreateOrderRes = {
    order_id: number;
    order_key: string;
    order_number: string | number;
    status: string;
    currency: string;
    total: string | number;
    // payment_url?: string; // on l'ignore désormais
};

function fmtMGA(v: number) {
    try {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "MGA",
            maximumFractionDigits: 0,
        }).format(v);
    } catch {
        return `${Math.round(v)} Ariary`;
    }
}

/**
 * Essaie d'appeler d'abord /api/checkout/..., puis /checkout/... si 404.
 * Utile si tes route handlers sont dans app/api/... OU app/checkout/...
 */
async function fetchJSONFallback<T = any>(path: string, init?: RequestInit): Promise<T> {
    const bases = ["/api", ""]; // ordre de préférence
    let lastErr: any = null;

    for (const base of bases) {
        const url = `${base}${path}`;
        try {
            const res = await fetch(url, { cache: "no-store", ...init });
            if (res.ok) {
                // @ts-ignore
                return (await res.json()) as T;
            }
            if (res.status === 404) {
                lastErr = new Error(`404 on ${url}`);
                continue; // tente la base suivante
            }
            const t = await res.text().catch(() => "");
            throw new Error(`HTTP ${res.status} ${t.slice(0, 200)} on ${url}`);
        } catch (e) {
            lastErr = e;
            // on essaie la base suivante
        }
    }
    throw lastErr ?? new Error("Unknown fetch error");
}

export default function CheckoutClient({
    initialLines,
    initialProducts,
}: {
    initialLines: Line[];
    initialProducts: BallouProduct[];
}) {
    const router = useRouter();
    const cart = useCart?.();

    // Panier effectif (contexte client prioritaire)
    const effectiveLines: Line[] = useMemo(() => {
        if (cart?.lines?.length) return cart.lines;
        return initialLines ?? [];
    }, [cart?.lines, initialLines]);

    // Map id -> produit pour le récap
    const productMap = useMemo(() => {
        const m = new Map<number, BallouProduct>();
        for (const p of initialProducts || []) m.set(p.id, p);
        return m;
    }, [initialProducts]);

    // --- états UI ---
    const [loadingOpts, setLoadingOpts] = useState(false);
    const [opts, setOpts] = useState<CheckoutOptions | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // --- adresses ---
    const [billing, setBilling] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address_1: "",
        address_2: "",
        city: "",
        postcode: "",
        country: "MG",
        state: "",
    });
    const [shipping, setShipping] = useState({
        first_name: "",
        last_name: "",
        address_1: "",
        address_2: "",
        city: "",
        postcode: "",
        country: "MG",
        state: "",
    });
    const [useBillingForShipping, setUseBillingForShipping] = useState(true);

    // --- choix ---
    const [shippingMethod, setShippingMethod] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<string>("");

    const mergedShipping = useMemo(
        () => (useBillingForShipping ? { ...shipping, ...billing } : shipping),
        [useBillingForShipping, billing, shipping]
    );

    // ---- charger options (paiements + shipping) via routes Next avec fallback ----
    async function loadOptions() {
        setLoadingOpts(true);
        setErr(null);
        try {
            const q = new URLSearchParams();
            if (effectiveLines.length) {
                q.set(
                    "lines",
                    effectiveLines.map((l) => `${l.id}:${l.qty}`).join(",")
                );
            }
            (["country", "state", "postcode", "city", "address_1", "address_2"] as const).forEach((k) => {
                const v = (mergedShipping as any)[k];
                if (v) q.set(k, String(v));
            });

            const data = await fetchJSONFallback<CheckoutOptions>(`/checkout/options?${q.toString()}`);
            setOpts(data);

            // Sélection shipping/paiement robuste
            if (data.shipping_methods?.length) {
                const stillValid = data.shipping_methods.find((m) => m.id === shippingMethod);
                setShippingMethod(stillValid ? stillValid.id : data.shipping_methods[0].id);
            } else {
                setShippingMethod("");
            }

            if (data.payments?.length) {
                const stillValid = data.payments.find((g) => g.id === paymentMethod && g.enabled);
                const firstEnabled = data.payments.find((g) => g.enabled);
                setPaymentMethod((stillValid || firstEnabled || data.payments[0]).id);
            } else {
                setPaymentMethod("");
            }
        } catch (e: any) {
            setErr(`Impossible de récupérer les options de checkout: ${e?.message ?? ""}`);
        } finally {
            setLoadingOpts(false);
        }
    }

    useEffect(() => {
        loadOptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(effectiveLines)]);

    // rafraîchir quand adresse change (debounce)
    useEffect(() => {
        const t = setTimeout(loadOptions, 500);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        mergedShipping.country,
        mergedShipping.state,
        mergedShipping.postcode,
        mergedShipping.city,
        mergedShipping.address_1,
        mergedShipping.address_2,
    ]);

    // ---- submit ----
    async function submitOrder(e: React.FormEvent) {
        e.preventDefault();
        if (!effectiveLines.length) {
            setErr("Votre panier est vide.");
            return;
        }
        if (!paymentMethod) {
            setErr("Veuillez choisir un mode de paiement.");
            return;
        }
        setSubmitting(true);
        setErr(null);
        try {
            const data = await fetchJSONFallback<CreateOrderRes>(`/checkout/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lines: effectiveLines,
                    coupons: [], // à remplir si besoin
                    billing,
                    shipping: mergedShipping,
                    shipping_method: shippingMethod || undefined,
                    payment_method: paymentMethod,
                }),
            });

            if (!("order_id" in data) || !("order_key" in data)) {
                throw new Error("Réponse inattendue du serveur.");
            }

            // ➜ On reste sur Next.js : page paiement locale
            router.push(`/checkout/paiement?order=${data.order_id}&key=${data.order_key}&method=${paymentMethod}`);
        } catch (e: any) {
            setErr(e?.message ?? "La création de la commande a échoué.");
        } finally {
            setSubmitting(false);
        }
    }

    const totalShipping = useMemo(() => {
        const m = opts?.shipping_methods?.find((m) => m.id === shippingMethod);
        return m ? m.total : 0;
    }, [opts?.shipping_methods, shippingMethod]);

    const itemsSubtotal = useMemo(() => {
        let s = 0;
        for (const l of effectiveLines) {
            const p = productMap.get(l.id);
            const unit = p ? pickUnitPrice(p) : 0;
            s += unit * l.qty;
        }
        return s;
    }, [effectiveLines, productMap]);

    if (!effectiveLines.length) {
        return (
            <div className="rounded-xl border p-6 text-center text-sm text-zinc-600">
                Votre panier est vide.
            </div>
        );
    }

    return (
        <form onSubmit={submitOrder} className="grid gap-6 md:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
                {/* Adresse de facturation */}
                <section className="rounded-xl border p-4">
                    <h2 className="mb-3 text-lg font-bold text-[#29235c]">Adresse de facturation</h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <input
                            className="input"
                            placeholder="Prénom"
                            value={billing.first_name}
                            onChange={(e) => setBilling({ ...billing, first_name: e.target.value })}
                            required
                        />
                        <input
                            className="input"
                            placeholder="Nom"
                            value={billing.last_name}
                            onChange={(e) => setBilling({ ...billing, last_name: e.target.value })}
                            required
                        />
                        <input
                            className="input sm:col-span-2"
                            placeholder="Adresse"
                            value={billing.address_1}
                            onChange={(e) => setBilling({ ...billing, address_1: e.target.value })}
                            required
                        />
                        <input
                            className="input"
                            placeholder="Ville"
                            value={billing.city}
                            onChange={(e) => setBilling({ ...billing, city: e.target.value })}
                            required
                        />
                        <input
                            className="input"
                            placeholder="Code postal"
                            value={billing.postcode}
                            onChange={(e) => setBilling({ ...billing, postcode: e.target.value })}
                        />
                        <input
                            className="input"
                            placeholder="Pays (ex: MG)"
                            value={billing.country}
                            onChange={(e) => setBilling({ ...billing, country: e.target.value.toUpperCase() })}
                        />
                        <input
                            className="input"
                            placeholder="Email"
                            type="email"
                            value={billing.email}
                            onChange={(e) => setBilling({ ...billing, email: e.target.value })}
                            required
                        />
                        <input
                            className="input"
                            placeholder="Téléphone"
                            value={billing.phone}
                            onChange={(e) => setBilling({ ...billing, phone: e.target.value })}
                        />
                    </div>
                </section>

                {/* Adresse de livraison */}
                <section className="rounded-xl border p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-[#29235c]">Adresse de livraison</h2>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={useBillingForShipping}
                                onChange={(e) => setUseBillingForShipping(e.target.checked)}
                            />
                            Identique à la facturation
                        </label>
                    </div>
                    {!useBillingForShipping && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <input
                                className="input"
                                placeholder="Prénom"
                                value={shipping.first_name}
                                onChange={(e) => setShipping({ ...shipping, first_name: e.target.value })}
                                required
                            />
                            <input
                                className="input"
                                placeholder="Nom"
                                value={shipping.last_name}
                                onChange={(e) => setShipping({ ...shipping, last_name: e.target.value })}
                                required
                            />
                            <input
                                className="input sm:col-span-2"
                                placeholder="Adresse"
                                value={shipping.address_1}
                                onChange={(e) => setShipping({ ...shipping, address_1: e.target.value })}
                                required
                            />
                            <input
                                className="input"
                                placeholder="Ville"
                                value={shipping.city}
                                onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                                required
                            />
                            <input
                                className="input"
                                placeholder="Code postal"
                                value={shipping.postcode}
                                onChange={(e) => setShipping({ ...shipping, postcode: e.target.value })}
                            />
                            <input
                                className="input"
                                placeholder="Pays (ex: MG)"
                                value={shipping.country}
                                onChange={(e) => setShipping({ ...shipping, country: e.target.value.toUpperCase() })}
                            />
                        </div>
                    )}
                </section>

                {/* Livraison */}
                <section className="rounded-xl border p-4">
                    <h2 className="mb-3 text-lg font-bold text-[#29235c]">Livraison</h2>
                    {loadingOpts ? (
                        <p className="text-sm text-zinc-500">Chargement des méthodes…</p>
                    ) : opts?.shipping_methods?.length ? (
                        <div className="space-y-2">
                            {opts.shipping_methods.map((m) => (
                                <label
                                    key={m.id}
                                    className="flex cursor-pointer items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="shipping_method"
                                            checked={shippingMethod === m.id}
                                            onChange={() => setShippingMethod(m.id)}
                                        />
                                        <span className="font-medium">{m.label}</span>
                                    </div>
                                    <span className="text-sm">{fmtMGA(m.total)}</span>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-zinc-500">Aucune méthode disponible pour l’adresse.</p>
                    )}
                </section>

                {/* Paiement */}
                <section className="rounded-xl border p-4">
                    <h2 className="mb-3 text-lg font-bold text-[#29235c]">Paiement</h2>
                    {opts?.payments?.length ? (
                        <div className="space-y-2">
                            {opts.payments.map((g) => (
                                <label
                                    key={g.id}
                                    className="flex cursor-pointer items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            checked={paymentMethod === g.id}
                                            onChange={() => setPaymentMethod(g.id)}
                                            disabled={!g.enabled}
                                        />
                                        <span className="font-medium">{g.title}</span>
                                    </div>
                                    {!g.enabled && <span className="text-xs text-zinc-400">désactivé</span>}
                                </label>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-zinc-500">Aucune passerelle détectée.</p>
                    )}
                </section>

                {err && (
                    <div className="rounded-lg border border-red-2 00 bg-red-50 p-3 text-sm text-red-700">
                        {err}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting || !effectiveLines.length}
                    className="w-full rounded-xl bg-[#29235c] px-4 py-3 font-semibold text-white disabled:opacity-50"
                >
                    {submitting ? "Création de la commande…" : "Payer maintenant"}
                </button>
            </div>

            {/* Récapitulatif */}
            <aside className="rounded-xl border p-4">
                <h3 className="mb-3 font-bold text-[#29235c]">Récapitulatif</h3>
                <ul className="mb-3 space-y-2 text-sm text-zinc-700">
                    {effectiveLines.map((l) => {
                        const p = productMap.get(l.id);
                        const title = p?.name ?? `Produit #${l.id}`;
                        const unit = p ? pickUnitPrice(p) : 0;
                        const lineTotal = unit * l.qty;
                        return (
                            <li key={l.id} className="flex items-center justify-between">
                                <span className="max-w-[70%] truncate" title={title}>
                                    {title} × {l.qty}
                                </span>
                                <span className="ml-2 whitespace-nowrap">{fmtMGA(lineTotal)}</span>
                            </li>
                        );
                    })}
                </ul>

                <div className="flex items-center justify-between text-sm">
                    <span>Sous-total</span>
                    <span>{fmtMGA(itemsSubtotal)}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-3 text-sm">
                    <span>Livraison</span>
                    <span>{fmtMGA(totalShipping)}</span>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                    Le total exact est calculé côté WooCommerce (taxes, remises, etc.).
                </p>
            </aside>

            <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 0.75rem;
          padding: 0.6rem 0.8rem;
          font-size: 0.9rem;
          background: white;
        }
      `}</style>
        </form>
    );
}