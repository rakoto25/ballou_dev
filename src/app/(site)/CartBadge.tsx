// src/app/(site)/CartBadge.tsx
"use client";

import { useEffect, useState } from "react";

async function fetchServerCount(): Promise<number> {
    try {
        const res = await fetch("/api/cart/count", { cache: "no-store" });
        if (!res.ok) return 0;
        const { count } = await res.json();
        return Number.isFinite(count) ? count : 0;
    } catch {
        return 0;
    }
}

// (optionnel) lit l'ancien cookie non-HttpOnly pour migration/cleanup
function getLegacyCountAndMaybeCleanup(): number {
    try {
        const m = document.cookie.split("; ").find((row) => row.startsWith("cart="));
        if (!m) return 0;
        const raw = decodeURIComponent(m.split("=", 2)[1] || "[]");
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr)) return 0;
        const sum = arr.reduce((s: number, it: any) => {
            const q = Number(it?.qty);
            return s + (Number.isFinite(q) && q > 0 ? q : 0);
        }, 0);

        // 🧹 on supprime l'ancien cookie non-HttpOnly pour éviter les confusions futures
        document.cookie = "cart=; Max-Age=0; path=/";

        return sum || 0;
    } catch {
        return 0;
    }
}

export default function CartBadge() {
    const [count, setCount] = useState<number>(0);

    const refresh = async () => {
        // 1) tente le serveur (source de vérité)
        const server = await fetchServerCount();
        if (server > 0) {
            setCount(server);
            return;
        }
        // 2) en dernier recours, migre/efface un éventuel vieux cookie lisible
        const legacy = getLegacyCountAndMaybeCleanup();
        setCount(legacy);
    };

    useEffect(() => {
        // init
        refresh();

        // mettre à jour au focus/retour onglet
        const onFocus = () => refresh();
        const onVisibility = () => {
            if (document.visibilityState === "visible") refresh();
        };

        // événement custom émis par CartClient après écriture du cookie côté serveur
        const onCartChanged = () => refresh();

        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onVisibility);
        window.addEventListener("cart:changed", onCartChanged as EventListener);

        return () => {
            window.removeEventListener("focus", onFocus);
            document.removeEventListener("visibilitychange", onVisibility);
            window.removeEventListener("cart:changed", onCartChanged as EventListener);
        };
    }, []);

    return (
        <span
            suppressHydrationWarning
            className="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#e94e1a] px-1.5 text-xs font-bold text-white"
            aria-label={`Articles dans le panier: ${count}`}
        >
            {count}
        </span>
    );
}