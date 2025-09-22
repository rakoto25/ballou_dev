// import ProductsClient from "./ProductsClient";
// import ProductsClient from "@/Components/produits/ProductsClient";
import ProductsClient from "@/app/Components/pages/produits/ProductsClient";
import { MOCK_PRODUCTS } from "@/app/Components/pages/produits/data";



export const metadata = {
    title: "Produits | Ballou",
    description: "Découvrez nos produits, filtrez par catégories et prix.",
};


export default function ProductsPage() {
    // Plus tard: fetch côté serveur via WooCommerce REST / DB
    return <ProductsClient initialProducts={MOCK_PRODUCTS} brandPrimary="#e94e1a" brandDark="#29235c" />;
}