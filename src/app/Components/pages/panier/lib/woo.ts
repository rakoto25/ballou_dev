// lib/woo.ts
import 'server-only';

const WP_BASE_URL = process.env.WP_BASE_URL;
const CK = process.env.WC_CONSUMER_KEY;
const CS = process.env.WC_CONSUMER_SECRET;

export type WCProductLite = {
    id: number;
    name: string;
    price: string;        // Woo renvoie du string
    images?: { src: string; alt?: string }[];
    permalink?: string;
};

export async function fetchProductsByIds(ids: number[]): Promise<WCProductLite[]> {
    if (!WP_BASE_URL || !CK || !CS || ids.length === 0) return mockProducts(ids);

    const url = new URL(`${WP_BASE_URL}/wp-json/wc/v3/products`);
    url.searchParams.set('include', ids.join(','));
    url.searchParams.set('per_page', String(ids.length));
    url.searchParams.set('consumer_key', CK);
    url.searchParams.set('consumer_secret', CS);

    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) return mockProducts(ids);
    const data = (await res.json()) as WCProductLite[];
    return data.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
}

// Fallback simple si Woo pas encore branché
function mockProducts(ids: number[]): WCProductLite[] {
    return ids.map((id, i) => ({
        id,
        name: `Produit démo #${id}`,
        price: (19900 + i * 5000).toString(), // centimes simulés en "string"
        images: [{ src: 'https://dummyimage.com/800x800/29235c/ffffff.png&text=Ballou', alt: 'Ballou' }],
        permalink: `/product/demo-${id}`,
    }));
}