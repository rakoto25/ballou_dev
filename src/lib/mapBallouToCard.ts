import type { BallouProduct } from "./ballou";
// import type { Product } from "@/app/(site)/produits/ProductTypes";
import type { Product } from "../app/Components/pages/produits/ProductTypes";

function priceStrToNumberMGA(price: string, currency: string): number {
    // Woo renvoie généralement "199000" ou "199000.00" en MGA => on convertit en number et on arrondit.
    const n = Number(price);
    if (!Number.isFinite(n)) return 0;
    // Si ta boutique n'est pas en MGA, adapte ici (conversion FX éventuelle).
    return Math.round(n);
}

export function mapBallouToProductCard(p: BallouProduct): Product {
    return {
        id: p.id,
        title: p.name,
        category: p.categories?.[0]?.name || "Autres",
        priceMGA: priceStrToNumberMGA(p.price, p.currency),
        ref: p.sku || p.slug,
        img: p.images?.[0]?.src || "/placeholder-800x800.png",
        slug: p.slug,
        createdAt: p.created_at || null,
    };
}