// src/lib/ballou.ts

// ---------------------------------------------------------
// Helpers URL / Origines (Edge-safe, Next.js 15 / React 19)
// ---------------------------------------------------------

/** Origin du front (utile côté client) */
function getAppOrigin(): string {
    if (typeof window !== 'undefined') return window.location.origin;
    if (process.env.NEXT_PUBLIC_APP_ORIGIN) return process.env.NEXT_PUBLIC_APP_ORIGIN.replace(/\/$/, '');
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    const port = process.env.PORT || 3000;
    return `http://localhost:${port}`;
}

/** Origin WordPress (backend).
 *  PROD/DEV: BALLOU_WP_ORIGIN conseillé (ex: http://localhost ou http://localhost:8080)
 *  Fallback dev : origin du front (utile si proxy)
 */
function getWpOrigin(): string {
    const origin =
        process.env.BALLOU_WP_ORIGIN ||
        getAppOrigin(); // fallback
    return origin.replace(/\/$/, '');
}

/** Absolutise via URL(relative, origin) — déterministe et Edge-compatible */
function absolutize(u: string): string {
    const origin = getWpOrigin();
    const href = new URL(u || '/', origin).href;
    return href.replace(/\/$/, '');
}

// ------------------
// Base API
// ------------------

/** Peut être relatif : /ballou/wp-json/ballou/v1 */
const RAW_BASE = process.env.NEXT_PUBLIC_BALLOU_API_BASE || '/ballou/wp-json/ballou/v1';

/** Base absolue garantie */
const API_BASE = absolutize(RAW_BASE);
export const API_BASE_ABS = API_BASE;

/** Log de contrôle (dev uniquement) */
if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[ballou] BALLOU_WP_ORIGIN =', getWpOrigin());
    // eslint-disable-next-line no-console
    console.log('[ballou] API_BASE_ABS =', API_BASE_ABS);
}

/** Endpoints absolus */
const API = {
    products: `${API_BASE}/products`,
    productBySlug: `${API_BASE}/product`,
    productsByIds: `${API_BASE}/products/by-ids`,
    categories: `${API_BASE}/categories`,
    cart: `${API_BASE}/cart`,
    checkoutOptions: `${API_BASE}/checkout`,
    checkoutCreate: `${API_BASE}/checkout`,
    bestsellers: `${API_BASE}/bestsellers`,
};

// ------------------
// Types (inchangés)
// ------------------
export type BallouImage = { src: string; alt?: string };
export type BallouProduct = {
    id: number; name: string; slug: string; permalink?: string; sku?: string | null;
    price: string; regular?: string | null; sale?: string | null; on_sale: boolean;
    currency: string; images?: BallouImage[]; categories?: { slug: string; name: string }[];
    stock_status?: 'instock' | 'outofstock' | 'onbackorder'; stock_qty?: number | null;
    created_at?: string; updated_at?: string;
};
export type PagedProductsResponse = { items: BallouProduct[]; page: number; per_page: number; total: number; pages: number; };
export type ProductsByIdsResponse = { items: BallouProduct[] };
export type BallouCategory = { id: number; name: string; slug: string; parent: number; count: number; image?: string | null; children?: BallouCategory[]; };
export type CategoriesResponse = { items: BallouCategory[] };
export type CartLine = { id: number; qty: number };
export type CartApiItem = { id: number; qty: number; max_qty: number | null; available: boolean; unit_price: number; line_total: number; currency: string; product: BallouProduct; };
export type CartAddress = { country: string; state?: string; postcode?: string; city?: string; address_1?: string; address_2?: string; };
export type CouponInput = string;
export type AppliedCoupon = { code: string; type: 'percent' | 'fixed_cart' | 'fixed_product' | string; amount: number; applied: number; valid: boolean; message?: string; };
export type ShippingRate = { id: string; label: string; cost: number; tax: number; total: number; meta?: Record<string, any>; };
export type CartTotals = { subtotal_ex_tax: number; discount_ex_tax: number; items_tax: number; shipping_total: number; shipping_tax: number; tax_total: number; total: number; currency: string; };
export type CartQuoteResponse = { items: CartApiItem[]; currency: string; totals: CartTotals; applied_coupons?: AppliedCoupon[]; shipping_methods?: ShippingRate[]; chosen_shipping_method?: string | null; };
export type CartQuoteRequest = { lines: CartLine[]; coupons?: CouponInput[]; address?: CartAddress; shipping_method?: string; };
export type CheckoutLine = { id: number; qty: number; variation_id?: number; attributes?: Record<string, string>; };
export type CheckoutBilling = { first_name: string; last_name: string; company?: string; email: string; phone?: string; address_1: string; address_2?: string; city: string; postcode?: string; country: string; state?: string; };
export type CheckoutShipping = { first_name?: string; last_name?: string; company?: string; address_1?: string; address_2?: string; city?: string; postcode?: string; country?: string; state?: string; };
export type PaymentGatewayLite = { id: string; title: string; description?: string; enabled: boolean; };
export type CheckoutOptionsResponse = { payments: PaymentGatewayLite[]; shipping_methods: ShippingRate[]; currency: string; };
export type CheckoutCreateRequest = { lines: CheckoutLine[]; coupons?: string[]; billing: CheckoutBilling; shipping?: CheckoutShipping; shipping_method?: string; payment_method: string; };
export type CheckoutCreateResponse = { order_id: number; order_key: string; order_number: string | number; status: string; currency: string; total: string | number; payment_url?: string; };

// ------------------
// Helpers généraux
// ------------------
function qs(params: Record<string, any> = {}): string {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null || v === '') continue;
        u.set(k, String(v));
    }
    const s = u.toString();
    return s ? `?${s}` : '';
}

/** fetch JSON (absolutise encore par sécurité) */
async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
    const abs = new URL(url, getWpOrigin()).href; // Edge-safe
    const res = await fetch(abs, init);
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${res.statusText} for ${abs} :: ${text.slice(0, 200)}`);
    }
    return res.json() as Promise<T>;
}

// ------------------
// Checkout (options / création / confirmation)
// ------------------

export async function fetchCheckoutOptions(params: {
    lines?: CartLine[];
    address?: CartAddress & { address_1?: string; address_2?: string };
} = {}): Promise<CheckoutOptionsResponse> {
    const query: Record<string, any> = {};
    if (params.lines?.length) query.lines = params.lines.map((l) => `${l.id}:${l.qty}`).join(',');
    if (params.address) {
        const { country, state, postcode, city, address_1, address_2 } = params.address;
        Object.assign(query, { country, state, postcode, city, address_1, address_2 });
    }
    const url = `${API.checkoutOptions}${qs(query)}`;
    return fetchJSON<CheckoutOptionsResponse>(url, { cache: 'no-store' });
}

export async function createCheckoutOrder(body: CheckoutCreateRequest): Promise<CheckoutCreateResponse> {
    const res = await fetch(API.checkoutCreate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        cache: 'no-store',
    });

    if (!res.ok) {
        const raw = await res.text().catch(() => '');
        let payload: any = null;
        try { payload = JSON.parse(raw); } catch { }
        const code = payload?.error || payload?.code || 'create_failed';
        const msg = payload?.message || raw.slice(0, 300) || res.statusText;

        const err = new Error(msg) as any;
        err.status = res.status;
        err.code = code;
        err.payload = payload;
        throw err;
    }

    return res.json() as Promise<CheckoutCreateResponse>;
}

// ------------------
// API Catégories / Produits
// ------------------

export type CategoriesResponse = { items: BallouCategory[] };

export async function listCategories(params: { depth?: number; hide_empty?: boolean } = {}): Promise<CategoriesResponse> {
    const url = `${API.categories}${qs(params)}`;
    const response = await fetchJSON<CategoriesResponse>(url, { next: { revalidate: 300 } });
    const categoriesWithName = response.items.filter((c) => c.name);
    return { items: categoriesWithName };
}

// ------------------
// Prix & format
// ------------------

export const ZERO_DEC = new Set(['MGA', 'JPY', 'KRW', 'VND', 'CLP', 'XOF', 'XAF', 'KMF', 'PYG', 'RWF', 'UGX', 'VUV', 'XPF', 'ISK', 'HUF', 'BIF', 'DJF', 'GNF']);

export function parseWooPrice(raw: string | null | undefined, currency?: string): number {
    const s = String(raw ?? '0').replace(/,/g, '.');
    let n = Number(s);
    if (!Number.isFinite(n)) return 0;
    if (currency && ZERO_DEC.has(currency.toUpperCase())) return Math.round(n);
    if (/\./.test(s)) return n;
    if (n > 1000) return n;
    return n / 100;
}

export function priceToNumber(price: string, currency?: string): number {
    if (price == null) return 0;
    const normalized = String(price).replace(',', '.');
    const base = Number(normalized);
    if (!Number.isFinite(base)) return 0;
    if (currency && currency.toUpperCase() === 'MGA') return base;
    return /\./.test(normalized) ? base : base / 100;
}

export function pickUnitPrice(p: BallouProduct): number {
    const chosen = p.sale ?? p.price ?? p.regular ?? '0';
    return parseWooPrice(chosen, p.currency);
}

export function primaryImage(p: BallouProduct): string | undefined {
    return p.images && p.images.length ? p.images[0].src : undefined;
}

export type GridItem = { id: number; title: string; category: string; price: number; ref: string; img?: string; slug: string; };

export function toGridItem(p: BallouProduct): GridItem {
    return {
        id: p.id,
        title: p.name,
        category: p.categories?.[0]?.name || '',
        price: priceToNumber(p.price, p.currency),
        ref: p.sku || `SKU-${p.id}`,
        img: primaryImage(p),
        slug: p.slug,
    };
}

// ------------------
// Produits (API)
// ------------------

export async function listProducts(params: Record<string, string | number | boolean> = {}): Promise<PagedProductsResponse> {
    const url = `${API.products}${qs(params)}`;
    return fetchJSON<PagedProductsResponse>(url, { next: { revalidate: 60 } });
}

export async function productsByIds(ids: number[]): Promise<ProductsByIdsResponse> {
    if (!ids || ids.length === 0) return { items: [] };
    const url = `${API.productsByIds}${qs({ include: ids.join(',') })}`;
    return fetchJSON<ProductsByIdsResponse>(url, { cache: 'no-store' });
}

export async function productBySlug(slug: string): Promise<BallouProduct> {
    const url = `${API.productBySlug}${qs({ slug })}`;
    return fetchJSON<BallouProduct>(url, { next: { revalidate: 60 } });
}

// ------------------
// Panier
// ------------------

export async function fetchCartQuote(req: CartQuoteRequest): Promise<CartQuoteResponse> {
    const res = await fetch(API.cart, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
        cache: 'no-store',
    });
    if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`Cart API error ${res.status}: ${t.slice(0, 200)}`);
    }
    return res.json() as Promise<CartQuoteResponse>;
}

export async function fetchCartSummary(lines: CartLine[]) {
    return fetchCartQuote({ lines });
}

// ------------------
// Bestsellers
// ------------------

export type BestSellerApiItem = { id: number; name: string; slug: string; price: string; currency: string; image?: string; stock_status?: 'instock' | 'outofstock' | 'onbackorder'; stock_qty?: number | null; total_sold?: number; };
export type BestSellerApiResponse = { items: BestSellerApiItem[]; meta: { days: number; limit: number; category?: string; include_variations?: boolean; }; };

export async function fetchBestSellers(params: { limit?: number; days?: number; category?: string; include_variations?: boolean; } = {}): Promise<BestSellerApiResponse> {
    const url = `${API.bestsellers}${qs(params)}`;
    return fetchJSON<BestSellerApiResponse>(url, { cache: 'no-store' });
}

export type BestSellerLite = { id: number; title: string; slug: string; price: number; image: string; };

export async function fetchBestSellersLite(params: { limit?: number; days?: number; category?: string; include_variations?: boolean; } = {}): Promise<BestSellerLite[]> {
    const limit = params.limit ?? 12;
    const data = await fetchBestSellers(params);
    let out: BestSellerLite[] = (data.items || []).map((r) => ({
        id: r.id, title: r.name, slug: r.slug, price: parseWooPrice(r.price, r.currency), image: r.image || '/placeholder.png',
    }));

    if (out.length === 0) {
        const { items } = await listProducts({
            per_page: Math.min(limit, 48),
            in_stock: true,
            orderby: 'date',
            order: 'desc',
            ...(params.category ? { category: params.category } : {}),
        });
        out = (items || []).slice(0, limit).map((p) => ({
            id: p.id, title: p.name, slug: p.slug, price: pickUnitPrice(p), image: primaryImage(p) || '/placeholder.png',
        }));
    }

    return out;
}

// ------------------
// Checkout confirm (POST /checkout/confirm)
// ------------------

export type ConfirmCheckoutRequest = { order_id?: number; payment_method?: string;[k: string]: any; };
export type ConfirmCheckoutResponse = { success: boolean; order_id?: number; status?: string; message?: string; redirect_url?: string;[k: string]: any; };

export async function confirmCheckout(body: ConfirmCheckoutRequest): Promise<ConfirmCheckoutResponse> {
    const url = `${API_BASE_ABS}/checkout/confirm`;
    return fetchJSON<ConfirmCheckoutResponse>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        cache: 'no-store',
    });
}
