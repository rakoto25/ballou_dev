// cart.ts
import { cookies } from "next/headers";

export type CartLine = { id: number; qty: number };

export async function readCart(): Promise<CartLine[]> {
    const store = await cookies(); // ⬅️ await obligatoire
    const raw = store.get("cart")?.value ?? "[]";
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}
