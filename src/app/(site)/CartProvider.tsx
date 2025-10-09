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

// --- helpers cookies ---
function readCartCookie(): Line[] {
    try {
        const match = document.cookie.split(';').find(c => c.trim().startsWith('cart='));
        if (!match) return [];
        const raw = decodeURIComponent(match.split('=')[1] || '[]');
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return arr.filter(x => typeof x?.id === 'number' && typeof x?.qty === 'number');
        return [];
    } catch { return []; }
}

function writeLocalShadow(lines: Line[]) {
    // miroir local pour badge instantané et éventuels refresh
    localStorage.setItem('cart_shadow', JSON.stringify(lines));
}
function readLocalShadow(): Line[] {
    try {
        return JSON.parse(localStorage.getItem('cart_shadow') || '[]');
    } catch { return []; }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [lines, setLines] = useState<Line[]>([]);

    // init depuis cookie ou localStorage (shadow) pour 1er rendu client
    useEffect(() => {
        const initial = readCartCookie();
        setLines(initial.length ? initial : readLocalShadow());
    }, []);

    // écoute les changements de storage (si autre onglet modifie)
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === 'cart_shadow') {
                setLines(readLocalShadow());
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);

    // --- actions qui appellent tes API routes et mettent à jour l'état + shadow ---
    const setQty = async (id: number, qty: number) => {
        if (qty < 0) qty = 0;
        // Optimistic UI
        setLines(prev => {
            const next = [...prev];
            const i = next.findIndex(l => l.id === id);
            if (i === -1 && qty > 0) next.push({ id, qty });
            else if (i >= 0) {
                if (qty === 0) next.splice(i, 1);
                else next[i] = { id, qty };
            }
            writeLocalShadow(next);
            return next;
        });
        // PATCH cookie serveur
        await fetch('/api/cart/update', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, qty }),
        }).catch(() => { });
    };

    const add = async (id: number, delta: number = 1) => {
        const current = lines.find(l => l.id === id)?.qty || 0;
        await setQty(id, current + delta);
    };

    const remove = async (id: number) => {
        // Optimistic
        setLines(prev => {
            const next = prev.filter(l => l.id !== id);
            writeLocalShadow(next);
            return next;
        });
        await fetch('/api/cart/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        }).catch(() => { });
    };

    const value = useMemo<CartContextType>(() => ({ lines, count, add, setQty, remove }), [lines, count]);

    return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
    const ctx = useContext(CartCtx);
    if (!ctx) throw new Error('useCart must be used within <CartProvider>');
    return ctx;
}