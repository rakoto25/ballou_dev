"use client";

import * as React from "react";
import Bestsellers, {
    STATIC_BESTSELLERS,
    type BestsellerProduct,
} from "./BestSeller"; // ou "./bestseller" selon le vrai nom du fichier

export default function BestsellersClient() {
    const handleAddToCart = React.useCallback((p: BestsellerProduct) => {
        // ⬇️ Branche ici ton store panier / API / toast, etc.
        console.log("add to cart:", p.id, p.title);
    }, []);

    return (
        <Bestsellers
            products={STATIC_BESTSELLERS} // tu peux aussi omettre: le composant a déjà un fallback
            onAddToCart={handleAddToCart}
        />
    );
}