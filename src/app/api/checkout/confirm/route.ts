// app/api/checkout/confirm/route.ts
import { NextResponse } from 'next/server';

// Edge runtime compatible
export const runtime = 'edge';

/** Récupère l'origin WP (doit être absolu en prod) */
function getWpOrigin(): string {
    const fromEnv =
        process.env.BALLOU_WP_ORIGIN || // <- A DEFINIR EN PROD
        (process.env.NEXT_PUBLIC_APP_ORIGIN ?? '') || // fallback éventuel
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
        'http://localhost';

    return fromEnv.replace(/\/$/, '');
}

/** Absolutise une base potentiellement relative via URL() */
function absolutizeBase(base: string): string {
    const origin = getWpOrigin();
    const href = new URL(base || '/', origin).href;
    return href.replace(/\/$/, '');
}

// Base REST WP (relative autorisée)
const RAW_BASE = process.env.NEXT_PUBLIC_BALLOU_API_BASE || '/ballou/wp-json/ballou/v1';
const API_BASE = absolutizeBase(RAW_BASE);

// Petit garde-fou: en prod, on veut absolument un https?://
if (process.env.NODE_ENV === 'production' && !/^https?:\/\//i.test(API_BASE)) {
    console.error('[api/checkout/confirm] API_BASE INVALID EN PROD =', API_BASE, 'RAW_BASE=', RAW_BASE);
}

export async function POST(req: Request) {
    console.log('[api/checkout/confirm] API_BASE =', API_BASE);
    const payload = await req.json().catch(() => ({}));
    const order_id = payload?.order_id;
    const order_key = payload?.order_key;

    if (!order_id || !order_key) {
        return NextResponse.json(
            { error: 'bad_payload', message: 'order_id / order_key manquants' },
            { status: 400 }
        );
    }

    const url = `${API_BASE}/checkout/confirm`;
    console.log('[api/checkout/confirm] POST ->', url);

    try {
        const wpRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id, order_key }),
            cache: 'no-store',
        });

        const contentType = wpRes.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const data = await wpRes.json().catch(() => ({}));
            return NextResponse.json(data, { status: wpRes.status });
        } else {
            const text = await wpRes.text().catch(() => '');
            return NextResponse.json(
                { error: 'unexpected_content', status: wpRes.status, body_preview: text.slice(0, 2000) },
                { status: 502 }
            );
        }
    } catch (e: any) {
        console.error('[api/checkout/confirm] fetch failed', e);
        return NextResponse.json({ error: 'fetch_failed', message: String(e) }, { status: 502 });
    }
}
