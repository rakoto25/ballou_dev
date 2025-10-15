'use client'
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Props = { orderId: number; orderKey: string; method?: string };

export default function PayClient({ orderId, orderKey, method = 'cod' }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const offlineGateways = ['cod', 'bacs', 'cheque'];

    useEffect(() => {
        console.log('[PayClient] props ->', { orderId, orderKey, method });
    }, [orderId, orderKey, method]);

    async function confirmOrder() {
        setLoading(true);
        setError(null);

        if (!orderId || !orderKey) {
            setError('ID ou clé de commande manquante. Impossible de confirmer.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/checkout/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderId, order_key: orderKey }),
                cache: 'no-store',
            });

            let data: any = {};
            try {
                data = await res.json();
            } catch (e) {
                const text = await res.text();
                console.error('[PayClient] impossible de parser JSON:', text);
                setError('Réponse serveur invalide.');
                setLoading(false);
                return;
            }

            console.log('[PayClient] confirm response:', res.status, data);

            if (!res.ok) {
                setError(data?.message || data?.error || `Erreur HTTP ${res.status}`);
                setLoading(false);
                return;
            }

            // Vérifie présence de order_id + order_key
            if (!data?.order_id || !data?.order_key) {
                console.error('[PayClient] réponse incomplète du serveur :', data);
                setError('Réponse serveur incomplète : order_id ou order_key manquant.');
                setLoading(false);
                return;
            }

            // Paiements en ligne
            if (data?.payment_url) {
                window.location.assign(data.payment_url);
                return;
            }

            // Gateways hors-ligne → rester sur Next.js et naviguer vers page merci
            if (offlineGateways.includes(String(method).toLowerCase())) {
                const nextTarget = `/checkout/merci?order=${encodeURIComponent(data.order_id)}&key=${encodeURIComponent(data.order_key)}`;
                console.log('[PayClient] redirecting to (Next.js) ->', nextTarget);
                router.replace(nextTarget);
                return;
            }

            // Fallback: thankyou_url absolue
            const thankyou = data?.thankyou_url ?? data?.thankyouUrl ?? null;
            if (thankyou && /^https?:\/\//i.test(thankyou)) {
                window.location.assign(thankyou);
                return;
            }

            setError('Confirmation réussie, mais aucune action de redirection définie.');
        } catch (e: any) {
            console.error('[PayClient] exception', e);
            setError(String(e?.message || e));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <button
                onClick={confirmOrder}
                disabled={loading}
                className="inline-flex items-center rounded bg-[#e94e1a] px-4 py-2 text-white"
            >
                {loading ? 'Confirmation…' : 'Confirmer la commande'}
            </button>

            {error && <div style={{ color: 'crimson', marginTop: 12 }}>{error}</div>}
        </div>
    );
}