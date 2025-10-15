import CartClient from "./CartClient"; // ou "./cartClient" selon l’option choisie ci-dessus
import { readCart } from "@/app/Components/pages/panier/lib/cart";
import { fetchCartQuote, type CartQuoteResponse } from "@/lib/ballou";

export const metadata = { title: "Panier — Ballou" };
export const dynamic = "force-dynamic";

export default async function PanierPage() {
    const lines = await readCart();

    let initialQuote: CartQuoteResponse;
    try {
        initialQuote = await fetchCartQuote({ lines });
    } catch (e) {
        // Fallback minimal pour rendre la page même si le backend est HS
        initialQuote = {
            items: [],
            currency: "MGA",
            totals: {
                subtotal_ex_tax: 0,
                discount_ex_tax: 0,
                items_tax: 0,
                shipping_total: 0,
                shipping_tax: 0,
                tax_total: 0,
                total: 0,
                currency: "MGA",
            },
            applied_coupons: [],
            shipping_methods: [],
            chosen_shipping_method: null,
        };
    }

    return (
        <main className="mx-auto max-w-7xl p-6">
            {/* Stepper */}
            <nav className="mb-8">
                <ol className="flex items-center gap-3 text-sm">
                    <li className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#29235c] text-white">1</span>
                        <span className="font-medium text-[#29235c]">Panier</span>
                    </li>
                    <li className="text-[#29235c]/30">—</li>
                    <li className="flex items-center gap-2 opacity-50">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#29235c]/30">2</span>
                        <span>Adresse</span>
                    </li>
                    <li className="text-[#29235c]/30">—</li>
                    <li className="flex items-center gap-2 opacity-50">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#29235c]/30">3</span>
                        <span>Paiement</span>
                    </li>
                </ol>
            </nav>

            <CartClient initialLines={lines} initialQuote={initialQuote} />
        </main>
    );
}