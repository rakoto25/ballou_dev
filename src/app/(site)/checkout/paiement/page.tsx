// src/app/(site)/checkout/paiement/page.tsx
import PayClient from "./PayClient";

export const dynamic = "force-dynamic";

type SP = {
    order?: string;
    key?: string;
    method?: string;
};

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<SP>;
}) {
    const sp = await searchParams;

    const orderId = Number(sp?.order ?? 0);
    const orderKey = String(sp?.key ?? "");
    const method = String(sp?.method ?? "cod");

    // (Optionnel) garde-fous si paramètres manquants
    // if (!orderId || !orderKey) { notFound() / redirect("/checkout") … }

    return <PayClient orderId={orderId} orderKey={orderKey} method={method} />;
}