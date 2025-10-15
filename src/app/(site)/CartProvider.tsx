'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Line = { id: number; qty: number };

type CartContextType = {
    lines: Line[];
    count: number;
    add: (id: number, delta?: number) => Promise<void>;
    setQty: (id: number, qty: number) => Promise<void>;
    remove: (id: number) => Promise<void>;
};

const CartCtx = createContext<CartContextType | null>(null);

// ---------- Shadow local pour rendu instantané & multi-onglets ----------
const SHADOW_KEY = 'cart_shadow';

function writeShadow(lines: Line[]) {
    try {
        localStorage.setItem(SHADOW_KEY, JSON.stringify(lines));
    } catch { }
}

function readShadow(): Line[] {
    try {
        const raw = localStorage.getItem(SHADOW_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(arr)) return [];
        return arr
            .map((l: any) => ({ id: Number(l?.id), qty: Number(l?.qty) }))
            .filter((l) => Number.isFinite(l.id) && Number.isFinite(l.qty) && l.qty > 0);
    } catch {
        return [];
    }
}

// ---------- Récupère les lignes côté serveur (cookie HttpOnly) ----------
async function fetchServerLines(): Promise<Line[]> {
    try {
        const res = await fetch('/api/cart/lines', { cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        const arr = Array.isArray(data?.lines) ? data.lines : [];
        return arr
            .map((l: any) => ({ id: Number(l?.id), qty: Number(l?.qty) }))
            .filter((l) => Number.isFinite(l.id) && Number.isFinite(l.qty) && l.qty > 0);
    } catch {
        return [];
    }
}

// ---------- Dispatch un event pour prévenir le reste du front ----------
function emitCartChanged() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart:changed'));
    }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [lines, setLines] = useState<Line[]>([]);

    // 1) Rendu client initial : shadow pour instantané, puis sync serveur (HttpOnly)
    useEffect(() => {
        // instantané
        setLines(readShadow());

        // synchro serveur (source de vérité)
        let alive = true;
        (async () => {
            const server = await fetchServerLines();
            if (!alive) return;
            setLines(server);
            writeShadow(server);
        })();
        return () => {
            alive = false;
        };
    }, []);

    // 2) Multi-onglets : si un autre onglet modifie le panier
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === SHADOW_KEY) {
                setLines(readShadow());
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);

    // --- Actions (optimistic UI + synchro serveur) ---
    const setQty = async (id: number, qty: number) => {
        // clamp
        qty = Math.max(0, Math.floor(qty));

        // Optimistic
        setLines((prev) => {
            const next = [...prev];
            const i = next.findIndex((l) => l.id === id);
            if (i === -1 && qty > 0) next.push({ id, qty });
            else if (i >= 0) {
                if (qty === 0) next.splice(i, 1);
                else next[i] = { id, qty };
            }
            writeShadow(next);
            return next;
        });

        // PATCH serveur (écrit le cookie HttpOnly)
        try {
            await fetch('/api/cart/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, qty }),
            });
        } catch {
            // En cas d'erreur réseau on garde l'optimistic state, tu peux re-synchroniser si besoin :
            // const server = await fetchServerLines(); setLines(server); writeShadow(server);
        } finally {
            emitCartChanged();
        }
    };

    const add = async (id: number, delta: number = 1) => {
        const current = lines.find((l) => l.id === id)?.qty || 0;
        await setQty(id, current + delta);
    };

    const remove = async (id: number) => {
        // Optimistic
        setLines((prev) => {
            const next = prev.filter((l) => l.id !== id);
            writeShadow(next);
            return next;
        });

        try {
            await fetch('/api/cart/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
        } catch {
            // idem : on pourrait re-sync depuis le serveur si tu veux
        } finally {
            emitCartChanged();
        }
    };

    const value = useMemo<CartContextType>(
        () => ({ lines, count, add, setQty, remove }),
        [lines, count]
    );

    return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
export function useCart() {
    const ctx = useContext(CartCtx);
    if (!ctx) throw new Error('useCart must be used within <CartProvider>');
    return ctx;
}