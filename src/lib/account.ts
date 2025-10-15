// src/lib/account.ts
export type AccountData = {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    display_name?: string;
    registration_date?: string;
    billing?: Record<string, any> | null;
    shipping?: Record<string, any> | null;
    recent_orders?: any[];
    orders_count?: number;
};

export type ApiError = { success: false; message?: string; status?: number };
export type ApiSuccess<T = any> = { success: true } & T;
export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

const API_BASE =
    process.env.NEXT_PUBLIC_BALLOU_API_BASE || '/wp-json/ballou/v1';

/** Helper pour parser réponse */
async function handleResponse<T = any>(res: Response): Promise<ApiResponse<T>> {
    try {
        const ct = res.headers.get('content-type') || '';
        const data = ct.includes('application/json') ? await res.json() : { message: await res.text() };

        if (!res.ok) {
            return {
                success: false,
                message: data?.message || data?.error || `Erreur HTTP ${res.status}`,
                status: res.status
            };
        }

        return { success: true, ...(data as T) } as ApiResponse<T>;
    } catch (error) {
        return {
            success: false,
            message: 'Erreur de traitement de la réponse',
            status: res.status
        };
    }
}

/** Test de connectivité API */
export async function testApiConnection(): Promise<ApiResponse> {
    try {
        const res = await fetch(`${API_BASE}/test`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            // Timeout de 5 secondes
            signal: AbortSignal.timeout(5000)
        });
        return handleResponse(res);
    } catch (error: any) {
        console.error('Test API connection error:', error);
        return {
            success: false,
            message: error.name === 'TimeoutError' ? 'Timeout de connexion' : 'Impossible de contacter l\'API'
        };
    }
}

/** Inscription utilisateur */
export async function registerUser(username: string, email: string, password: string): Promise<ApiResponse> {
    try {
        const res = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, email, password }),
        });
        return handleResponse(res);
    } catch (error) {
        return { success: false, message: 'Erreur réseau lors de l\'inscription' };
    }
}

/** Connexion utilisateur */
export async function loginUser(username: string, password: string): Promise<ApiResponse> {
    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
        });
        return handleResponse(res);
    } catch (error) {
        return { success: false, message: 'Erreur réseau lors de la connexion' };
    }
}

/** Récupération du compte */
export async function getAccount(): Promise<ApiResponse<AccountData>> {
    try {
        const res = await fetch(`${API_BASE}/account`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        return handleResponse<AccountData>(res);
    } catch (error) {
        return { success: false, message: 'Erreur réseau lors de la récupération du compte' };
    }
}

/** Mise à jour du compte */
export async function updateAccount(data: Partial<AccountData>): Promise<ApiResponse> {
    try {
        const res = await fetch(`${API_BASE}/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data),
        });
        return handleResponse(res);
    } catch (error) {
        return { success: false, message: 'Erreur réseau lors de la mise à jour' };
    }
}

/** Déconnexion utilisateur */
export async function logoutUser(): Promise<ApiResponse> {
    try {
        // Côté client, on peut simplement effacer les cookies
        // WordPress ne fournit pas d'endpoint logout REST par défaut

        // Effacer tous les cookies WordPress
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            if (name.startsWith('wordpress_') || name.startsWith('wp_')) {
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            }
        });

        return { success: true, message: 'Déconnexion réussie' };
    } catch (error) {
        return { success: false, message: 'Erreur lors de la déconnexion' };
    }
}

/** Helper pour vérifier si l'utilisateur est connecté */
export async function isLoggedIn(): Promise<boolean> {
    try {
        const result = await getAccount();
        return result.success && !!result.id;
    } catch {
        return false;
    }
}
