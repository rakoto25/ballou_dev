// app/produit-unique/[slug]/page.tsx
import { notFound } from "next/navigation";
import SingleProduct, { Product } from "@/app/Components/pages/produits/single/singleproduct";
import SimilarProduct from "@/app/Components/pages/produits/single/similarproduct";
import {
    productBySlug,
    listProducts,
    type BallouProduct,
    parseWooPrice,
} from "@/lib/ballou";

export const dynamicParams = true;
// mets 0 si tu veux du 100% fresh à chaque requête, sinon 60s de cache ISR
export const revalidate = 60;

/** Adapter BallouProduct -> Product (type attendu par SingleProduct/SimilarProduct)
 *  - rating enlevé
 *  - conversion prix forcée en Ariary (MGA)
 *  - passage du stock (stockQty) depuis stock_qty
 */
function mapBallouToSingleProduct(p: BallouProduct): Product {
    const price = parseWooPrice(p.sale ?? p.price ?? p.regular ?? "0", "MGA");
    const oldPrice = p.regular ? parseWooPrice(p.regular, "MGA") : undefined;

    // stock effectif : 0 si outofstock, sinon valeur numérique si connue, sinon "illimité" (undefined)
    const stockQty =
        p.stock_status === "outofstock"
            ? 0
            : typeof p.stock_qty === "number"
                ? Math.max(0, p.stock_qty)
                : undefined;

    return {
        id: String(p.id),
        slug: p.slug,
        name: p.name,
        price,
        oldPrice,
        images: (p.images ?? []).map((i) => i.src).filter(Boolean),
        description: "",
        specs: [
            p.sku ? { label: "Référence", value: p.sku } : null,
            p.stock_status ? { label: "Stock", value: p.stock_status } : null,
        ].filter(Boolean) as { label: string; value: string }[],
        tags: (p.categories ?? []).map((c) => c.name),
        category: p.categories?.[0]?.slug ?? "autres",
        stockQty, // 👈 transmis au composant pour brider (-/+) à la quantité réelle
    };
}

async function getProduct(slug: string): Promise<Product> {
    let raw: BallouProduct | null = null;
    try {
        raw = await productBySlug(slug);
    } catch {
        // 404 API ou autre
    }
    if (!raw) notFound();
    return mapBallouToSingleProduct(raw);
}

async function getSimilarProducts(prod: Product): Promise<Product[]> {
    if (!prod.category) return [];
    const { items } = await listProducts({
        per_page: 8,
        in_stock: true,
        category: prod.category, // slug de catégorie
    });
    return items
        .filter((p) => p.slug !== prod.slug)
        .map(mapBallouToSingleProduct);
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const slug = decodeURIComponent(params.slug);
    try {
        const p = await productBySlug(slug);
        return {
            title: `${p.name} — Ballou`,
            description: `Acheter ${p.name}`,
        };
    } catch {
        return { title: "Produit — Ballou" };
    }
}

export default async function Page({ params }: { params: { slug: string } }) {
    const slug = decodeURIComponent(params.slug);

    const product = await getProduct(slug);
    const similars = await getSimilarProducts(product);

    return (
        <main className="mx-auto max-w-6xl px-4 py-10">
            <SingleProduct product={product} brandPrimary="#e94e1a" brandDark="#29235c" />
            {similars.length > 0 && (
                <SimilarProduct products={similars} brandPrimary="#e94e1a" brandDark="#29235c" />
            )}
        </main>
    );
}