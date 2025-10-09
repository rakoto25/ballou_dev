// lib/cart.ts
import 'server-only';
import { cookies } from 'next/headers';

export type CartLine = { id: number; qty: number };
export type Cart = CartLine[];

export function readCart(): Cart {
    const raw = cookies().get('cart')?.value || '[]';
    try { return JSON.parse(raw) as Cart; } catch { return []; }
}