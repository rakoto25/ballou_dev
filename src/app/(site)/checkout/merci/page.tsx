import React from 'react';
import MerciInvoice from './MerciInvoice';
import { headers } from 'next/headers';

type Props = {
    searchParams?: Promise<{ order?: string; key?: string }>;
};

function getAppOriginFromHeaders(): string {
    const h = headers();
    const proto = h.get('x-forwarded-proto') ?? 'http';
    const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
    return `${proto}://${host}`;
}

export default async function Page({ searchParams }: Props) {
    const resolvedSearchParams = await searchParams;

    const orderId = resolvedSearchParams?.order;
    const orderKey = resolvedSearchParams?.key;

    if (!orderId || !orderKey) {
        return (
            <main style={{ maxWidth: 900, margin: '3rem auto', padding: '0 1rem' }}>
                <h1>Commande introuvable</h1>
                <p>Paramètres manquants — impossible d’afficher la page de confirmation.</p>
            </main>
        );
    }

    // On passe par l’API interne Next (sécurisée et déjà absolue côté handler)
    const appOrigin = process.env.NEXT_PUBLIC_APP_ORIGIN || getAppOriginFromHeaders();
    const url = `${appOrigin}/api/checkout/confirm`;

    let data: any = null;
    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: Number(orderId), order_key: String(orderKey) }),
            cache: 'no-store',
        });

        if (!resp.ok) {
            // essaie JSON puis texte
            let errMessage = `Erreur HTTP ${resp.status}`;
            try {
                const errData = await resp.json();
                errMessage = errData?.message || errData?.error || errMessage;
            } catch {
                const txt = await resp.text().catch(() => '');
                if (txt) errMessage = `${errMessage} — ${txt.slice(0, 200)}`;
            }
            return (
                <main style={{ maxWidth: 900, margin: '3rem auto', padding: '0 1rem' }}>
                    <h1>Erreur</h1>
                    <p>{errMessage}</p>
                </main>
            );
        }

        data = await resp.json();

        if (!data?.lines || !Array.isArray(data.lines)) {
            data.lines = [];
        }
    } catch (e: any) {
        return (
            <main style={{ maxWidth: 900, margin: '3rem auto', padding: '0 1rem' }}>
                <h1>Erreur</h1>
                <p>Impossible de récupérer la commande depuis le serveur.</p>
                <pre style={{ whiteSpace: 'pre-wrap' }}>{String(e?.message || e)}</pre>
            </main>
        );
    }

    return (
        <main style={{ maxWidth: 900, margin: '2.5rem auto', padding: '0 1rem' }}>
            <h1>Merci pour votre commande</h1>
            <MerciInvoice data={data} />
        </main>
    );
}