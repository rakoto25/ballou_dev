"use client";

import { useEffect, useState } from "react";

/** Lit le cookie "cart" (JSON) et retourne la somme des qty. */
function getCartCountFromCookie(): number {
    try {
        const m = document.cookie
            .split("; ")
            .find((row) => row.startsWith("cart="));
        if (!m) return 0;
        const raw = decodeURIComponent(m.split("=", 2)[1] || "[]");
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr)) return 0;
        let sum = 0;
        for (const it of arr) {
            const q = Number(it?.qty);
            if (Number.isFinite(q) && q > 0) sum += q;
        }
        return sum;
    } catch {
        return 0;
    }
}

export default function CartBadge() {
    const [count, setCount] = useState<number>(0);

    const refresh = () => setCount(getCartCountFromCookie());

    useEffect(() => {
        // 1) init
        refresh();

        // 2) se met à jour quand on revient sur l’onglet / focus
        const onFocus = () => refresh();
        const onVisibility = () => {
            if (document.visibilityState === "visible") refresh();
        };

        // 3) écoute un événement custom "cart:changed" (émis par CartClient)
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

    // Affiche toujours un badge, même à 0 (demande)
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