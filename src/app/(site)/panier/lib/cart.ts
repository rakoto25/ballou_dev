import { cookies } from "next/headers";

export type Line = { id: number; qty: number };

/** Lit le cookie "cart" proprement (Next >=14/15 : cookies() doit être await). */
export async function readCart(): Promise<Line[]> {
    try {
        const jar = await cookies();
        const raw = jar.get("cart")?.value ?? "[]";
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        // Normalisation/validation
        return parsed
            .map((l) => ({
                id: Number(l?.id),
                qty: Number(l?.qty),
            }))
            .filter((l) => Number.isFinite(l.id) && Number.isFinite(l.qty) && l.qty > 0);
    } catch {
        return [];
    }
}