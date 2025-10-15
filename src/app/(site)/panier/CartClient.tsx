"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    fetchCartQuote,
    type CartLine,
    type CartQuoteResponse,
    type CartAddress,
} from "@/lib/ballou";

type Props = {
    initialLines: CartLine[];
    initialQuote: CartQuoteResponse;
};

export default function CartClient({ initialLines, initialQuote }: Props) {
    const router = useRouter();

    const [lines, setLines] = useState<CartLine[]>(initialLines);
    const [quote, setQuote] = useState<CartQuoteResponse>(initialQuote);

    const [isPending, startTransition] = useTransition();
    const [syncing, setSyncing] = useState(0); // nombre d'opés réseau qui écrivent le cookie
    const [error, setError] = useState<string | null>(null);
    const isBusy = isPending || syncing > 0;

    // Coupons (pas en cookie)
    const [couponInput, setCouponInput] = useState("");
    const [coupons, setCoupons] = useState<string[]>(
        initialQuote.applied_coupons?.filter((c) => c.valid).map((c) => c.code) ?? []
    );

    // Adresse (impacte shipping & taxes livraison)
    const [address, setAddress] = useState<CartAddress>({
        country: "MG",
        postcode: "101",
        city: "Antananarivo",
        address_1: "",
    });

    // Livraison sélectionnée
    const [chosenShip, setChosenShip] = useState<string | undefined>(
        initialQuote.chosen_shipping_method ?? undefined
    );

    const currency = quote.totals?.currency || quote.currency || "MGA";

    const fmtMGA = (n: number) => {
        const v = Math.round(Number.isFinite(n) ? n : 0);
        try {
            return new Intl.NumberFormat("fr-MG", {
                style: "currency",
                currency: "MGA",
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
            }).format(v);
        } catch {
            return `${v.toLocaleString("fr-FR")} Ar`;
        }
    };

    /** Helper : enrobe un fetch qui écrit un cookie pour compter/attendre la sync */
    const runSync = async <T,>(fn: () => Promise<T>): Promise<T> => {
        setSyncing((n) => n + 1);
        try {
            const out = await fn();
            if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("cart:changed"));
            }
            return out;
        } finally {
            setSyncing((n) => Math.max(0, n - 1));
        }
    };

    const persistQty = async (id: number, qty: number) => {
        await runSync(() =>
            fetch("/api/cart/update", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, qty }),
            })
        );
    };

    const persistRemove = async (id: number) => {
        await runSync(() =>
            fetch("/api/cart/remove", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            })
        );
    };

    /** Recalcule le devis côté WP */
    const refresh = (opts?: { keepChosen?: boolean }) => {
        startTransition(async () => {
            setError(null);
            try {
                const res = await fetchCartQuote({
                    lines,
                    coupons,
                    address,
                    shipping_method: opts?.keepChosen ? chosenShip : undefined,
                });
                setQuote(res);
                setChosenShip(res.chosen_shipping_method ?? undefined);
            } catch (e: any) {
                setError(e?.message || "Erreur lors du recalcul du panier.");
            }
        });
    };

    // Recalcule quand l’adresse change
    useEffect(() => {
        refresh({ keepChosen: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address.country, address.postcode, address.city]);

    // Actions
    const changeQty = (id: number, next: number) => {
        const it = quote.items.find((i) => i.id === id);
        const max = it?.max_qty ?? null;
        const clamped = Math.max(1, max === null ? next : Math.min(next, max));

        setLines((prev) => prev.map((l) => (l.id === id ? { ...l, qty: clamped } : l)));

        startTransition(async () => {
            await persistQty(id, clamped);
            refresh({ keepChosen: true });
        });
    };

    const removeLine = (id: number) => {
        setLines((prev) => prev.filter((l) => l.id !== id));
        startTransition(async () => {
            await persistRemove(id);
            refresh({ keepChosen: true });
        });
    };

    const applyCoupon = () => {
        const code = couponInput.trim().toLowerCase();
        if (!code) return;
        if (coupons.includes(code)) {
            setCouponInput("");
            return;
        }
        setCoupons((prev) => [...prev, code]);
        setCouponInput("");
        refresh({ keepChosen: true });
    };

    const removeCoupon = (code: string) => {
        setCoupons((prev) => prev.filter((c) => c !== code.toLowerCase()));
        refresh({ keepChosen: true });
    };

    const selectShippingMethod = (id: string) => {
        setChosenShip(id);
        startTransition(async () => {
            try {
                const res = await fetchCartQuote({
                    lines,
                    coupons,
                    address,
                    shipping_method: id,
                });
                setQuote(res);
            } catch (e: any) {
                setError(e?.message || "Erreur lors du choix de la livraison.");
            }
        });
    };

    const totals = quote.totals || {
        subtotal_ex_tax: 0,
        discount_ex_tax: 0,
        items_tax: 0,
        shipping_total: 0,
        shipping_tax: 0,
        tax_total: 0,
        total: 0,
        currency,
    };

    // ✅ Détection des produits invalides (rupture ou stock dépassé)
    const invalidItems = quote.items.filter(
        (it) => !it.available || (it.max_qty !== null && it.qty > it.max_qty)
    );
    const hasInvalid = invalidItems.length > 0;

    // Aller au checkout — attend que les Set-Cookie soient écrits
    const goCheckout = async () => {
        if (hasInvalid) {
            setError("Certains articles ne sont plus disponibles. Veuillez corriger le panier.");
            return;
        }
        await new Promise((r) => setTimeout(r, 30));
        router.push("/checkout");
    };

    return (
        <div className="grid lg:grid-cols-[1fr,380px] gap-8">
            {/* Tableau panier */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100">
                <header className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <h1 className="text-xl font-semibold" style={{ color: "#29235c" }}>
                        Votre panier
                    </h1>
                    <span className="text-sm text-slate-500">{quote.items.length} article(s)</span>
                </header>

                {quote.items.length === 0 ? (
                    <div className="p-6 text-slate-600">
                        Votre panier est vide.{" "}
                        <a href="/produits" className="text-[#e94e1a] underline">
                            Continuer vos achats
                        </a>
                        .
                    </div>
                ) : (
                    <>
                        {/* Desktop */}
                        <div className="hidden md:block">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-slate-500">
                                        <th className="px-6 py-4 w-[120px]">Produit</th>
                                        <th className="px-6 py-4"></th>
                                        <th className="px-6 py-4">Prix</th>
                                        <th className="px-6 py-4">Quantité</th>
                                        <th className="px-6 py-4">Sous-total</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quote.items.map((it) => (
                                        <tr key={it.id} className="border-t border-slate-100">
                                            <td className="px-6 py-4">
                                                <img
                                                    src={it.product.images?.[0]?.src || "/placeholder.png"}
                                                    alt={it.product.images?.[0]?.alt || it.product.name}
                                                    className="h-20 w-20 rounded-xl object-cover"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <a
                                                    href={it.product.permalink || "#"}
                                                    className="font-medium hover:underline"
                                                    style={{ color: "#29235c" }}
                                                >
                                                    {it.product.name}
                                                </a>
                                                {!it.available && (
                                                    <div className="text-xs text-red-600 mt-1">Indisponible</div>
                                                )}
                                                {it.max_qty !== null && (
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        Stock max: {it.max_qty}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">{fmtMGA(it.unit_price)}</td>
                                            <td className="px-6 py-4">
                                                <div className="inline-flex items-center rounded-xl border border-slate-200 overflow-hidden">
                                                    <button
                                                        type="button"
                                                        className="px-3 py-2 hover:bg-slate-50 disabled:opacity-50"
                                                        onClick={() => changeQty(it.id, it.qty - 1)}
                                                        disabled={isBusy || it.qty <= 1}
                                                    >
                                                        −
                                                    </button>
                                                    <input
                                                        value={it.qty}
                                                        onChange={(e) =>
                                                            changeQty(
                                                                it.id,
                                                                Number.isFinite(parseInt(e.target.value))
                                                                    ? parseInt(e.target.value)
                                                                    : 1
                                                            )
                                                        }
                                                        className="w-12 text-center py-2 outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="px-3 py-2 hover:bg-slate-50 disabled:opacity-50"
                                                        onClick={() => changeQty(it.id, it.qty + 1)}
                                                        disabled={isBusy || (it.max_qty !== null && it.qty >= it.max_qty)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold">{fmtMGA(it.line_total)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => removeLine(it.id)}
                                                    className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                                                    style={{ color: "#e94e1a" }}
                                                    disabled={isBusy}
                                                >
                                                    Retirer
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="border-t border-slate-100 bg-slate-50/50">
                                        <td colSpan={4} className="px-6 py-4 text-right font-medium">
                                            Sous-total (HT)
                                        </td>
                                        <td className="px-6 py-4 font-bold" style={{ color: "#29235c" }}>
                                            {fmtMGA(totals.subtotal_ex_tax)}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {isPending && (
                    <div className="p-4 text-sm text-slate-500">Mise à jour du panier…</div>
                )}
            </section>

            {/* Récapitulatif */}
            <aside className="lg:sticky lg:top-6 h-fit">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100">
                        <h2 className="text-lg font-semibold" style={{ color: "#29235c" }}>
                            Récapitulatif
                        </h2>
                    </div>

                    <div className="px-6 py-5 space-y-4">
                        {/* Totaux */}
                        <div className="space-y-2 text-sm">
                            <Row label="Sous-total (HT)" value={fmtMGA(totals.subtotal_ex_tax)} />
                            {totals.discount_ex_tax > 0 && (
                                <Row label="Remises (HT)" value={`- ${fmtMGA(totals.discount_ex_tax)}`} />
                            )}
                            <Row label="Taxes articles" value={fmtMGA(totals.items_tax)} />
                            <Row label="Livraison (HT)" value={fmtMGA(totals.shipping_total)} />
                            <Row label="Taxes livraison" value={fmtMGA(totals.shipping_tax)} />
                            <div className="h-px bg-slate-100" />
                            <Row bold label="Total TTC" value={fmtMGA(totals.total)} />
                        </div>

                        {/* ⚠️ Produits invalides */}
                        {hasInvalid && (
                            <div className="text-sm text-red-600 border border-red-200 bg-red-50 p-3 rounded-xl">
                                Certains articles ne sont plus disponibles :
                                <ul className="list-disc pl-5 mt-1">
                                    {invalidItems.map((it) => (
                                        <li key={it.id}>
                                            {it.product?.name}{" "}
                                            {!it.available
                                                ? "(indisponible)"
                                                : it.max_qty !== null
                                                    ? `(max ${it.max_qty})`
                                                    : ""}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        {/* Bouton sécurisé */}
                        <button
                            type="button"
                            onClick={goCheckout}
                            disabled={isBusy || quote.items.length === 0 || hasInvalid}
                            className="mt-2 block w-full text-center px-5 py-3 rounded-xl bg-[#e94e1a] text-white font-medium hover:opacity-95 disabled:opacity-60"
                        >
                            {isBusy ? "Synchronisation…" : "Passer à la caisse"}
                        </button>

                        <a
                            href="/produits"
                            className="block text-center text-sm text-[#29235c] underline"
                        >
                            Continuer vos achats
                        </a>
                    </div>
                </div>
            </aside>
        </div>
    );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-slate-600">{label}</span>
            <span className={bold ? "text-lg font-bold" : "font-semibold"}>{value}</span>
        </div>
    );
}