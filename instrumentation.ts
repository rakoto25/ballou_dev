// instrumentation.ts
// Patch "fetch" côté Server/Edge pour absolutiser toute URL commençant par /ballou/wp-json/

function getWpOrigin() {
    const fromEnv =
        process.env.BALLOU_WP_ORIGIN ||
        process.env.NEXT_PUBLIC_APP_ORIGIN ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
        'http://localhost';
    return fromEnv.replace(/\/$/, '');
}

export async function register() {
    const wpOrigin = getWpOrigin();
    const origFetch = globalThis.fetch;

    globalThis.fetch = (input: any, init?: RequestInit) => {
        try {
            if (typeof input === 'string' && input.startsWith('/ballou/wp-json/')) {
                const abs = new URL(input, wpOrigin).href;
                return origFetch(abs, init);
            }
            if (typeof Request !== 'undefined' && input instanceof Request) {
                const url = input.url;
                if (url.startsWith('/ballou/wp-json/')) {
                    const abs = new URL(url, wpOrigin).href;
                    const req2 = new Request(abs, input);
                    return origFetch(req2, init);
                }
            }
        } catch {
            // noop: on retombe sur le fetch original
        }
        return origFetch(input, init);
    };

    if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log('[instrumentation] fetch patched; wpOrigin =', wpOrigin);
    }
}