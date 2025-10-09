// app/produits/page.tsx
import ProductsClient from "@/app/Components/pages/produits/ProductsClient";
import { listProducts, listCategories } from "@/lib/ballou";
import { mapBallouToProductCard } from "@/lib/mapBallouToCard";

export const revalidate = 60;

type ProduitsPageProps = {
    searchParams?: { category?: string; q?: string; page?: string };
};

export default async function ProduitsPage({ searchParams }: ProduitsPageProps) {
    const category = searchParams?.category ?? null;
    const q = searchParams?.q ?? null;

    const { items } = await listProducts({
        per_page: 48,
        in_stock: true,
        ...(category ? { category } : {}),
        ...(q ? { search: q } : {}),
    });

    const initialProducts = items.map(mapBallouToProductCard);

    return (
        <ProductsClient
            key={category ?? "all"}   // 👈 force le remount quand la catégorie change
            initialProducts={initialProducts}
            brandPrimary="#e94e1a"
            brandDark="#29235c"
        />
    );
}