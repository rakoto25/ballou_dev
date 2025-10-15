// app/produits/page.tsx
import ProductsClient from "@/app/Components/pages/produits/ProductsClient";
import { listProducts } from "@/lib/ballou";
import { mapBallouToProductCard } from "@/lib/mapBallouToCard";

export const revalidate = 60;

type ProduitsPageProps = {
    // Next 15 : searchParams est un Promise
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProduitsPage({ searchParams }: ProduitsPageProps) {
    // On attend le Promise et on normalise string | string[] -> string | null
    const sp = await searchParams;
    const category = Array.isArray(sp.category) ? sp.category[0] : sp.category ?? null;
    const q = Array.isArray(sp.q) ? sp.q[0] : sp.q ?? null;
    const pageStr = Array.isArray(sp.page) ? sp.page[0] : sp.page;
    const page = pageStr ? Math.max(1, parseInt(pageStr, 10) || 1) : 1;

    const { items } = await listProducts({
        per_page: 48,
        page,
        in_stock: true,
        ...(category ? { category } : {}),
        ...(q ? { search: q } : {}),
    });

    const initialProducts = items.map(mapBallouToProductCard);

    return (
        <ProductsClient
            key={category ?? "all"}   // force le remount quand la catégorie change
            initialProducts={initialProducts}
            brandPrimary="#e94e1a"
            brandDark="#29235c"
        />
    );
}