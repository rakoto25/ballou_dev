import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type Line = { id: number; qty: number };

export async function POST(req: Request) {
    const { id } = await req.json().catch(() => ({}));
    const pid = Number(id);
    if (!Number.isFinite(pid)) {
        return NextResponse.json({ ok: false, error: "Bad payload" }, { status: 400 });
    }

    const jar = await cookies(); // ⚠️ await
    let cart: Line[] = [];
    try {
        cart = JSON.parse(jar.get("cart")?.value || "[]");
    } catch { }

    cart = cart.filter((l) => l.id !== pid);

    const res = NextResponse.json({ ok: true, cart });
    res.headers.set(
        "Set-Cookie",
        `cart=${encodeURIComponent(JSON.stringify(cart))}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`
    );
    return res;
}