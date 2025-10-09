import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type Line = { id: number; qty: number };

export async function PATCH(req: Request) {
    const { id, qty } = await req.json().catch(() => ({}));
    const pid = Number(id);
    const q = Number(qty);

    if (!Number.isFinite(pid) || !Number.isFinite(q) || q < 0) {
        return NextResponse.json({ ok: false, error: "Bad payload" }, { status: 400 });
    }

    const jar = await cookies(); // ⚠️ await
    let cart: Line[] = [];
    try {
        cart = JSON.parse(jar.get("cart")?.value || "[]");
    } catch { }

    const i = cart.findIndex((l) => l.id === pid);
    if (q === 0) {
        if (i > -1) cart.splice(i, 1);
    } else {
        if (i > -1) cart[i].qty = q;
        else cart.push({ id: pid, qty: q });
    }

    const res = NextResponse.json({ ok: true, cart });
    res.headers.set(
        "Set-Cookie",
        `cart=${encodeURIComponent(JSON.stringify(cart))}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`
    );
    return res;
}