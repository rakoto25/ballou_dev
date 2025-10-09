"use client";
import { useState } from "react";

export default function PayClient({ orderId, orderKey, method }: {
    orderId: number; orderKey: string; method: string;
}) {
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const payOffline = async () => {
        setBusy(true); setErr(null);
        try {
            const r = await fetch("/api/checkout/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order_id: orderId, order_key: orderKey }),
            });
            if (!r.ok) throw new Error(await r.text());
            const data = await r.json();
            // Page merci locale
            window.location.href = `/merci?order=${data.order_id}&status=${data.status}`;
        } catch (e: any) {
            setErr(e?.message || "Erreur.");
        } finally { setBusy(false); }
    };

    if (method === "cod" || method === "bacs" || method === "cheque") {
        return (
            <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow">
                <h1 className="text-xl font-semibold mb-4">Confirmer la commande</h1>
                <p className="mb-4">Paiement hors-ligne sélectionné ({method}).</p>
                {err && <p className="text-red-600 text-sm mb-2">{err}</p>}
                <button disabled={busy} onClick={payOffline}
                    className="px-5 py-3 rounded-xl bg-[#29235c] text-white disabled:opacity-60">
                    {busy ? "Validation..." : "Confirmer"}
                </button>
            </div>
        );
    }

    // Ici: SDK Stripe / PayPal, etc.
    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow">
            <h1 className="text-xl font-semibold mb-4">Paiement</h1>
            <p>Intègre ici le SDK du provider ({method}).</p>
        </div>
    );
}