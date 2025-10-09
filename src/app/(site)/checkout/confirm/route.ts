// app/api/checkout/confirm/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { order_id, order_key } = await req.json().catch(() => ({}));
    if (!order_id || !order_key) {
        return NextResponse.json({ error: "bad_payload" }, { status: 400 });
    }
    const wp = await fetch(`${process.env.NEXT_PUBLIC_BALLOU_API_BASE?.replace(/\/$/, "")}/checkout/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id, order_key }),
        cache: "no-store",
    });
    const data = await wp.json().catch(() => ({}));
    if (!wp.ok) {
        return NextResponse.json({ error: "wp_error", details: data }, { status: 500 });
    }
    return NextResponse.json(data);
}