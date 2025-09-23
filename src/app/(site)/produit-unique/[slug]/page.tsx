import SingleProduct, { Product } from "@/app/Components/pages/produits/single/singleproduct";
import SimilarProduct from "@/app/Components/pages/produits/single/similarproduct";

// rendre la route bien dynamique en dev
export const dynamicParams = true;
export const revalidate = 0;

/** Démo MOCK — remplace par ton fetch Woo/WP/Odoo */
const MOCK: Product[] = [
    {
        id: "1",
        slug: "sneakers-ballou-neo",
        name: "Sneakers Ballou Néo",
        price: 79.9,
        oldPrice: 99.9,
        rating: 4.6,
        images: [
            "https://picsum.photos/id/1011/800/800",
            "https://picsum.photos/id/1012/800/800",
            "https://picsum.photos/id/1013/800/800",
        ],
        description: "Confort maximal et style affirmé. Parfaites pour vos sorties quotidiennes.",
        specs: [
            { label: "Coloris", value: "Blanc / Orange" },
            { label: "Matière", value: "Mesh / Synthétique" },
            { label: "Genre", value: "Unisexe" },
        ],
        tags: ["sneakers", "nouveauté", "ballou"],
        category: "chaussures",
    },
    {
        id: "2",
        slug: "basket-street-pro",
        name: "Basket Street Pro",
        price: 69.0,
        rating: 4.2,
        images: ["https://picsum.photos/id/1021/800/800"],
        category: "chaussures",
    },
    {
        id: "3",
        slug: "sneakers-ultra-lite",
        name: "Sneakers Ultra Lite",
        price: 89.0,
        rating: 4.8,
        images: ["https://picsum.photos/id/1022/800/800"],
        category: "chaussures",
    },
    {
        id: "4",
        slug: "chaussure-casual-air",
        name: "Chaussure Casual Air",
        price: 59.9,
        images: ["https://picsum.photos/id/1033/800/800"],
        category: "chaussures",
    },
];

function deslugify(slug: string) {
    const pretty = slug.replace(/-/g, " ");
    return pretty.charAt(0).toUpperCase() + pretty.slice(1);
}

async function getProductBySlug(slug: string): Promise<Product | null> {
    const found = MOCK.find((p) => p.slug === slug);
    if (found) return found;

    // 👇 Fallback en DEV : fabrique un produit si le slug n’est pas dans le MOCK
    // (utile tant que ta grille et ta page détail ne consomment pas la même source)
    return {
        id: slug,
        slug,
        name: deslugify(slug),
        price: 0,
        rating: 0,
        images: ["https://picsum.photos/seed/" + encodeURIComponent(slug) + "/800/800"],
        description: "Fiche produit générée automatiquement pour le slug « " + deslugify(slug) + " ». Branche tes vraies données CMS/API pour le contenu final.",
        specs: [],
        tags: [],
        category: "autres",
    };
}

async function getSimilarProducts(prod: Product): Promise<Product[]> {
    return MOCK.filter((p) => p.category === prod.category && p.slug !== prod.slug);
}

/** Utilisé seulement en export statique (prod cPanel) */
export async function generateStaticParams() {
    return MOCK.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const product = await getProductBySlug(params.slug);
    return {
        title: product ? `${product.name} — Ballou` : "Produit — Ballou",
        description: product?.description ?? "Détail produit Ballou",
    };
}

export default async function Page({ params }: { params: { slug: string } }) {
    const product = await getProductBySlug(params.slug);
    const similars = await getSimilarProducts(product);

    return (
        <main className="mx-auto max-w-6xl px-4 py-10">
            <SingleProduct product={product} brandPrimary="#e94e1a" brandDark="#29235c" />
            <SimilarProduct products={similars} brandPrimary="#e94e1a" brandDark="#29235c" />
        </main>
    );
}