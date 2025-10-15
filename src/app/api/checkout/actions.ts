"use server";

import { createCheckoutOrder } from "@/lib/ballou"; // ton wrapper

export async function startCheckout(payload: {
    lines: { id: number; qty: number }[];
    billing: any;
    shipping?: any;
    shipping_method?: string;
    payment_method: string; // "cod" | "bacs" | "stripe" | ...
}) {
    const res = await createCheckoutOrder(payload); // appelle POST /checkout (WP)
    // Ne PAS rediriger vers res.payment_url !
    return {
        order_id: res.order_id,
        order_key: res.order_key,
        status: res.status,
        currency: res.currency,
        total: res.total,
    };
}