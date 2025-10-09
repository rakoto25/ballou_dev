// ------------------
// Base API
// ------------------
// Normalise la base API (sans trailing slash)
const API_BASE =
    (process.env.NEXT_PUBLIC_BALLOU_API_BASE ||
        "http://localhost/ballou/wp-json/ballou/v1").replace(/\/$/, "");

const API = {
    products: `${API_BASE}/products`,
    productBySlug: `${API_BASE}/product`,
    productsByIds: `${API_BASE}/products/by-ids`,
    categories: `${API_BASE}/categories`,
    cart: `${API_BASE}/cart`,              // résumé/devis panier (items, taxes, shipping, coupons…)
    checkoutOptions: `${API_BASE}/checkout`, // GET options
    checkoutCreate: `${API_BASE}/checkout`,  // POST create order
};

// ------------------
// Types de données (catalogue)
// ------------------
export type BallouImage = { src: string; alt?: string };

export type BallouProduct = {
    id: number;
    name: string;
    slug: string;
    permalink?: string;
    sku?: string | null;
    price: string; // "199.00" ou "19900" selon devise/config
    regular?: string | null;
    sale?: string | null;
    on_sale: boolean;
    currency: string; // ex: "MGA"
    images?: BallouImage[];
    categories?: { slug: string; name: string }[]; // Catégories du produit
    stock_status?: "instock" | "outofstock" | "onbackorder";
    stock_qty?: number | null;
    created_at?: string;
    updated_at?: string;
};

export type PagedProductsResponse = {
    items: BallouProduct[];
    page: number;
    per_page: number;
    total: number;
    pages: number;
};

export type ProductsByIdsResponse = { items: BallouProduct[] };

export type BallouCategory = {
    id: number;
    name: string;
    slug: string;
    parent: number;
    count: number;
    image?: string | null;
    children?: BallouCategory[]; // Catégories enfants si depth > 1
};

export type CategoriesResponse = { items: BallouCategory[] };

// ------------------
// Types panier (cart) — étendus
// ------------------
export type CartLine = { id: number; qty: number };

export type CartApiItem = {
    id: number;
    qty: number;
    max_qty: number | null; // null = illimité/backorders
    available: boolean;
    unit_price: number;     // number normalisé (Ariary → entier)
    line_total: number;     // number normalisé
    currency: string;       // ex: "MGA"
    product: BallouProduct; // payload produit complet
};

export type CartAddress = {
    country: string;
    state?: string;
    postcode?: string;
    city?: string;
    address_1?: string;
    address_2?: string;
};

export type CouponInput = string;

export type AppliedCoupon = {
    code: string;
    type: "percent" | "fixed_cart" | "fixed_product" | string;
    amount: number;  // valeur nominale du coupon
    applied: number; // montant réellement appliqué (ex-tax, ou total selon backend)
    valid: boolean;
    message?: string; // si non valide, raison
};

export type ShippingRate = {
    id: string;     // ex: "flat_rate:3"
    label: string;  // "Livraison standard"
    cost: number;   // hors taxes
    tax: number;    // taxes sur le shipping
    total: number;  // cost + tax
    meta?: Record<string, any>;
};

export type CartTotals = {
    subtotal_ex_tax: number; // somme des lignes HT
    discount_ex_tax: number; // remises HT
    items_tax: number;       // taxes sur les articles
    shipping_total: number;  // coût livraison HT
    shipping_tax: number;    // taxes livraison
    tax_total: number;       // items_tax + shipping_tax
    total: number;           // total TTC estimé
    currency: string;        // "MGA"
};

export type CartQuoteResponse = {
    items: CartApiItem[];
    currency: string;               // "MGA"
    totals: CartTotals;
    applied_coupons?: AppliedCoupon[];
    shipping_methods?: ShippingRate[]; // méthodes disponibles pour l’adresse
    chosen_shipping_method?: string | null;
};

export type CartQuoteRequest = {
    lines: CartLine[];
    coupons?: CouponInput[];
    address?: CartAddress;
    shipping_method?: string; // rate id choisi (ex: "flat_rate:3")
};

// -------- Checkout types --------
// Lignes envoyées pour CRÉER une commande : supporte les variations
export type CheckoutLine = {
    id: number;          // product_id (pour simple) ou parent_id (si variation fournie)
    qty: number;
    variation_id?: number;                 // id de la variation si produit variable
    attributes?: Record<string, string>;   // ex: { "attribute_pa_taille": "m" }
};

export type CheckoutBilling = {
    first_name: string; last_name: string; company?: string;
    email: string; phone?: string;
    address_1: string; address_2?: string;
    city: string; postcode?: string; country: string; state?: string;
};

export type CheckoutShipping = {
    first_name?: string; last_name?: string; company?: string;
    address_1?: string; address_2?: string;
    city?: string; postcode?: string; country?: string; state?: string;
};

export type PaymentGatewayLite = {
    id: string;
    title: string;
    description?: string;
    enabled: boolean;
};

export type CheckoutOptionsResponse = {
    payments: PaymentGatewayLite[];
    shipping_methods: ShippingRate[]; // (tu l'as déjà défini)
    currency: string;                 // ex: "MGA"
};

export type CheckoutCreateRequest = {
    lines: CheckoutLine[];      // ← ICI: lignes compatibles variations
    coupons?: string[];
    billing: CheckoutBilling;
    shipping?: CheckoutShipping;
    shipping_method?: string;   // ex: "flat_rate:3"
    payment_method: string;     // ex: "cod"
};

export type CheckoutCreateResponse = {
    order_id: number;
    order_key: string;
    order_number: string | number;
    status: string;
    currency: string;
    total: string | number;
    payment_url?: string; // désormais optionnel côté Next (on l'ignore)
};

/**
 * Récupère les passerelles de paiement actives et une estimation des méthodes de livraison.
 * Si "address" est fourni, l'estimation shipping sera basée dessus.
 *
 * NOTE: pour l’estimation, on se contente d’ID/qty (CartLine).
 */
export async function fetchCheckoutOptions(params: {
    lines?: CartLine[];
    address?: CartAddress & { address_1?: string; address_2?: string };
} = {}): Promise<CheckoutOptionsResponse> {
    const query: Record<string, any> = {};
    if (params.lines?.length) {
        query.lines = params.lines.map(l => `${l.id}:${l.qty}`).join(",");
    }
    if (params.address) {
        const { country, state, postcode, city, address_1, address_2 } = params.address;
        Object.assign(query, { country, state, postcode, city, address_1, address_2 });
    }

    const url = `${API.checkoutOptions}${qs(query)}`;
    return fetchJSON<CheckoutOptionsResponse>(url, { cache: "no-store" });
}

/**
 * Crée une commande WooCommerce (on ne suit plus payment_url côté front).
 */
export async function createCheckoutOrder(body: CheckoutCreateRequest): Promise<CheckoutCreateResponse> {
    const res = await fetch(API.checkoutCreate, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
    });
    if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Checkout API error ${res.status}: ${t.slice(0, 300)}`);
    }
    return res.json() as Promise<CheckoutCreateResponse>;
}

// ------------------
// API Catégories
// ------------------

/**
 * Liste des catégories (parents + enfants si depth=2)
 * Ex: listCategories({ depth: 2, hide_empty: true })
 */
export async function listCategories(
    params: { depth?: number; hide_empty?: boolean } = {}
): Promise<CategoriesResponse> {
    const url = `${API.categories}${qs(params)}`;
    const response = await fetchJSON<CategoriesResponse>(url, {
        next: { revalidate: 300 },
    });

    // Vérification des données avant de les renvoyer
    const categoriesWithName = response.items.filter((category) => category.name);
    return { items: categoriesWithName };
}

// ------------------
// Helpers généraux
// ------------------
function qs(params: Record<string, any> = {}): string {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null || v === "") continue;
        u.set(k, String(v));
    }
    const s = u.toString();
    return s ? `?${s}` : "";
}

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
            `HTTP ${res.status} ${res.statusText} for ${url} :: ${text.slice(0, 200)}`
        );
    }
    // WP envoie toujours du JSON ici
    return res.json() as Promise<T>;
}

// ------------------
// Prix & format
// ------------------

/**
 * Certaines devises n'ont pas de décimales (Ariary, Yen, etc.)
 * => on arrondit au plus proche entier et on ne divise pas par 100.
 */
export const ZERO_DEC = new Set([
    "MGA",
    "JPY",
    "KRW",
    "VND",
    "CLP",
    "XOF",
    "XAF",
    "KMF",
    "PYG",
    "RWF",
    "UGX",
    "VUV",
    "XPF",
    "ISK",
    "HUF",
    "BIF",
    "DJF",
    "GNF",
]);

/**
 * Parse une string de prix WooCommerce vers un number.
 * - Si la devise est "zéro décimale", on arrondit (entier).
 * - Si la string contient un ".", on parse tel quel (ex: "199.99").
 * - Sinon, si la valeur est > 1000 on considère que c'est déjà l'unité (ex: Ariary "250000"),
 *   sinon on considère que c'est en cents => /100 (ex: "19900" -> 199).
 */
export function parseWooPrice(
    raw: string | null | undefined,
    currency?: string
): number {
    const s = String(raw ?? "0").replace(/,/g, ".");
    let n = Number(s);
    if (!Number.isFinite(n)) return 0;

    if (currency && ZERO_DEC.has(currency.toUpperCase())) {
        return Math.round(n);
    }
    if (/\./.test(s)) return n; // déjà avec décimales
    if (n > 1000) return n;     // ex: 250000 (Ariary)
    return n / 100;              // ex: 19900 -> 199.00
}

/**
 * Convertit une string de prix Woo en number.
 * Variante "stable" : MGA -> entier; sinon "." => parse, sinon /100.
 */
export function priceToNumber(price: string, currency?: string): number {
    if (price == null) return 0;
    const normalized = String(price).replace(",", ".");
    const base = Number(normalized);
    if (!Number.isFinite(base)) return 0;

    if (currency && currency.toUpperCase() === "MGA") {
        return base; // pas de sous-unité pour l'Ariary
    }
    return /\./.test(normalized) ? base : base / 100;
}

/**
 * Sélectionne le "meilleur" prix unitaire (sale > price > regular)
 * et le convertit en number cohérent selon la devise.
 */
export function pickUnitPrice(p: BallouProduct): number {
    const chosen = p.sale ?? p.price ?? p.regular ?? "0";
    return parseWooPrice(chosen, p.currency);
}

/**
 * Image principale d’un produit (ou undefined).
 */
export function primaryImage(p: BallouProduct): string | undefined {
    return p.images && p.images.length ? p.images[0].src : undefined;
}

/**
 * Mapper d’un BallouProduct -> item léger pour une grille produit.
 */
export type GridItem = {
    id: number;
    title: string;
    category: string;
    price: number;
    ref: string;
    img?: string;
    slug: string;
};

export function toGridItem(p: BallouProduct): GridItem {
    return {
        id: p.id,
        title: p.name,
        category: p.categories?.[0]?.name || "",
        price: priceToNumber(p.price, p.currency),
        ref: p.sku || `SKU-${p.id}`,
        img: primaryImage(p),
        slug: p.slug,
    };
}

// ------------------
// API Produits
// ------------------

/**
 * Liste paginée de produits
 * Ex: listProducts({ page:1, per_page:16, category:'literie', on_sale:true })
 */
export async function listProducts(
    params: Record<string, string | number | boolean> = {}
): Promise<PagedProductsResponse> {
    // cache léger côté Next (60s)
    const url = `${API.products}${qs(params)}`;
    return fetchJSON<PagedProductsResponse>(url, { next: { revalidate: 60 } });
}

/**
 * Récupération par IDs (panier)
 * => pas de cache pour refléter le panier en temps réel.
 */
export async function productsByIds(ids: number[]): Promise<ProductsByIdsResponse> {
    if (!ids || ids.length === 0) return { items: [] };
    const url = `${API.productsByIds}${qs({ include: ids.join(",") })}`;
    return fetchJSON<ProductsByIdsResponse>(url, { cache: "no-store" });
}

/**
 * Détail par slug
 */
export async function productBySlug(slug: string): Promise<BallouProduct> {
    const url = `${API.productBySlug}${qs({ slug })}`;
    return fetchJSON<BallouProduct>(url, { next: { revalidate: 60 } });
}

// ------------------
// API Panier (devis/summary avancé)
// ------------------

/**
 * Devis/summary panier côté WP :
 * - POST /cart avec { lines, coupons?, address?, shipping_method? }
 * - Retour attendu : items, shipping_methods, applied_coupons, totals, currency, chosen_shipping_method
 *
 * Pas de cache (no-store) pour refléter l'état en temps réel.
 */
export async function fetchCartQuote(req: CartQuoteRequest): Promise<CartQuoteResponse> {
    const res = await fetch(API.cart, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
        cache: "no-store",
    });
    if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Cart API error ${res.status}: ${t.slice(0, 200)}`);
    }
    return res.json() as Promise<CartQuoteResponse>;
}

/**
 * Compat : ancienne signature (seulement lines) – wrappe fetchCartQuote
 */
export async function fetchCartSummary(lines: CartLine[]) {
    return fetchCartQuote({ lines });
}