import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type Line = { id: number; qty: number };

export async function GET() {
    const jar = await cookies();
    const raw = jar.get("cart")?.value ?? "[]";

    let lines: Line[] = [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            lines = parsed
                .map((l: any) => ({ id: Number(l?.id), qty: Number(l?.qty) }))
                .filter((l) => Number.isFinite(l.id) && Number.isFinite(l.qty) && l.qty > 0);
        }
    } catch {
        // ignore
    }

    return NextResponse.json({ lines });
}