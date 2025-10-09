import CheckoutClient from "./CheckoutClient";
import { readCart } from "@/app/Components/pages/panier/lib/cart";
import { productsByIds } from "@/lib/ballou";

export const metadata = { title: "Checkout — Ballou" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
    const initialLines = await readCart(); // ⚠️ await
    const ids = initialLines.map((l) => l.id);
    const { items: initialProducts } = await productsByIds(ids);

    return (
        <main className="mx-auto max-w-5xl p-6">
            <h1 className="mb-6 text-2xl font-extrabold text-[#29235c]">Finaliser la commande</h1>
            <CheckoutClient initialLines={initialLines} initialProducts={initialProducts} />
        </main>
    );
}