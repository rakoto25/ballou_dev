import { NextRequest, NextResponse } from "next/server";
import { createCheckoutOrder, CheckoutCreateRequest } from "@/lib/ballou";

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as CheckoutCreateRequest;
        const data = await createCheckoutOrder(body);
        return NextResponse.json(data, { status: 200 });
    } catch (e: any) {
        // Essaie de récupérer le code dans le message "Checkout API error XXX: ..."
        const m = /Checkout API error\s+(\d{3})\b/.exec(String(e?.message || ""));
        const status = m ? parseInt(m[1], 10) : 500;
        return NextResponse.json(
            { error: "create_failed", message: e?.message ?? "Unknown error" },
            { status }
        );
    }
}