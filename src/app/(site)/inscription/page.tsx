'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    registerUser,
    loginUser,
    testApiConnection,
    type ApiResponse
} from '@/lib/account';

/* Types locaux */
interface FormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface FieldErrors {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
}

/* Helpers */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function passwordStrength(pw: string) {
    // very simple scoring: length + variety of char classes
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[\W_]/.test(pw)) score++;
    return Math.min(score, 5); // 0..5
}
function strengthLabel(score: number) {
    return ['Très faible', 'Faible', 'Moyen', 'Bon', 'Fort', 'Très fort'][score];
}

/* Component */
export default function RegisterPage() {
    const router = useRouter();
    const usernameRef = useRef<HTMLInputElement | null>(null);
    const [formData, setFormData] = useState<FormData>({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<FieldErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [apiConnected, setApiConnected] = useState<boolean | null>(null);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        usernameRef.current?.focus();
        // check API connectivity (uses testApiConnection from lib)
        (async () => {
            try {
                if (typeof testApiConnection === 'function') {
                    const res = await testApiConnection();
                    setApiConnected(!!res?.success);
                    if (!res?.success) {
                        setMessage({ type: 'error', text: 'Impossible de contacter l’API. Vérifiez le serveur.' });
                    }
                } else {
                    // fallback: consider API ok if lib lacks test function
                    setApiConnected(true);
                }
            } catch {
                setApiConnected(false);
                setMessage({ type: 'error', text: 'Impossible de vérifier l’API.' });
            }
        })();

        // cleanup on unmount
        return () => {
            abortRef.current?.abort();
        };
    }, []);

    /* Gestion d'input */
    const onChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setFormData(prev => ({ ...prev, [field]: v }));
        setErrors(prev => ({ ...prev, [field]: undefined, general: undefined }));
        setMessage(null);
    };

    /* Validation client */
    const validate = (): boolean => {
        const newErrors: FieldErrors = {};
        const u = formData.username.trim();
        const e = formData.email.trim();
        const p = formData.password;
        const cp = formData.confirmPassword;

        if (!u) newErrors.username = 'Nom requis';
        else if (u.length < 3) newErrors.username = 'Au moins 3 caractères';
        else if (!/^[a-zA-Z0-9_-]+$/.test(u)) newErrors.username = 'Caractères autorisés: lettres, chiffres, _ et -';

        if (!e) newErrors.email = 'Email requis';
        else if (!emailRegex.test(e)) newErrors.email = 'Email invalide';

        if (!p) newErrors.password = 'Mot de passe requis';
        else if (p.length < 6) newErrors.password = 'Au moins 6 caractères';

        if (!cp) newErrors.confirmPassword = 'Confirmez le mot de passe';
        else if (p !== cp) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /* Tentative de connexion automatique */
    const autoLogin = async (username: string, password: string) => {
        try {
            const res: ApiResponse = await loginUser(username, password);
            return !!res.success;
        } catch (err) {
            console.error('login error', err);
            return false;
        }
    };

    /* Soumission */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (isLoading) return;
        if (!validate()) {
            setMessage({ type: 'error', text: 'Corrigez les erreurs du formulaire.' });
            return;
        }
        if (apiConnected === false) {
            setMessage({ type: 'error', text: 'Service indisponible.' });
            return;
        }

        // Abort previous requests if any
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        const signal = abortRef.current.signal;

        setIsLoading(true);
        try {
            const username = formData.username.trim();
            const email = formData.email.trim().toLowerCase();
            const password = formData.password;

            const regRes: ApiResponse = await registerUser(username, email, password);
            if (!regRes.success) {
                // map errors sent by API
                const errMsg = regRes.message ?? 'Erreur lors de la création du compte';
                // possible codes / fields
                if ((regRes as any).error === 'exists' || (regRes as any).error === 'username_exists') {
                    setErrors(prev => ({ ...prev, username: 'Ce nom d’utilisateur est déjà pris' }));
                    setMessage({ type: 'error', text: 'Nom d’utilisateur déjà utilisé.' });
                } else if ((regRes as any).error === 'email_exists') {
                    setErrors(prev => ({ ...prev, email: 'Cette adresse email est déjà utilisée' }));
                    setMessage({ type: 'error', text: 'Email déjà utilisé.' });
                } else {
                    setMessage({ type: 'error', text: errMsg });
                }
                return;
            }

            // inscription OK -> tenter connexion automatique
            setMessage({ type: 'success', text: 'Compte créé — tentative de connexion automatique...' });

            const loginOk = await autoLogin(username, password);
            if (loginOk) {
                setMessage({ type: 'success', text: 'Connexion établie — redirection...' });
                setIsRedirecting(true);
                // small delay to let cookie be set (if needed)
                setTimeout(() => {
                    router.push('/mon-compte');
                }, 800);
                return;
            }

            // si auto login échoue => rediriger vers connexion manuelle
            setMessage({ type: 'info', text: 'Compte créé. Connectez-vous.' });
            setTimeout(() => router.push('/connexion'), 1400);

        } catch (err: any) {
            if (signal.aborted) {
                console.warn('request aborted');
                return;
            }
            console.error('Erreur inscription', err);
            setMessage({ type: 'error', text: 'Erreur réseau ou serveur. Réessayez.' });
        } finally {
            setIsLoading(false);
        }
    };

    /* UI helpers */
    const pwScore = passwordStrength(formData.password);
    const canSubmit = !isLoading && apiConnected !== false;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Créer un compte</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Ou{' '}
                    <Link href="/connexion" className="font-medium text-blue-600 hover:text-blue-500">
                        connectez-vous
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {/* API status */}
                    {apiConnected === false && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                            ⚠️ Service API indisponible — certaines actions peuvent échouer.
                        </div>
                    )}

                    {message && (
                        <div className={`mb-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
                            <p className="text-sm">{message.text}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                        {/* username */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nom d'utilisateur *</label>
                            <div className="mt-1">
                                <input
                                    id="username"
                                    ref={usernameRef}
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    placeholder="Votre nom d'utilisateur"
                                    value={formData.username}
                                    onChange={onChange('username')}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${errors.username ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                                    disabled={!canSubmit || isRedirecting}
                                />
                                {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
                            </div>
                        </div>

                        {/* email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse email *</label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="votre@email.com"
                                    value={formData.email}
                                    onChange={onChange('email')}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                                    disabled={!canSubmit || isRedirecting}
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>
                        </div>

                        {/* password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe *</label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    placeholder="Minimum 6 caractères"
                                    value={formData.password}
                                    onChange={onChange('password')}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                                    disabled={!canSubmit || isRedirecting}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(s => !s)}
                                    className="absolute right-2 top-2 text-sm text-gray-500"
                                    aria-label={showPassword ? 'Masquer mot de passe' : 'Afficher mot de passe'}
                                >
                                    {showPassword ? 'Masquer' : 'Afficher'}
                                </button>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                <div>Force : <strong className="ml-1">{strengthLabel(pwScore)}</strong></div>
                                <div className="w-24 h-2 bg-gray-200 rounded overflow-hidden">
                                    <div style={{ width: `${(pwScore / 5) * 100}%` }} className={`h-full ${pwScore >= 4 ? 'bg-green-500' : pwScore >= 2 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                                </div>
                            </div>
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                        </div>

                        {/* confirm password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmer le mot de passe *</label>
                            <div className="mt-1">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Confirmez votre mot de passe"
                                    value={formData.confirmPassword}
                                    onChange={onChange('confirmPassword')}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                                    disabled={!canSubmit || isRedirecting}
                                />
                                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                            </div>
                        </div>

                        {/* submit */}
                        <div>
                            <button
                                type="submit"
                                disabled={!canSubmit || isRedirecting}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${(!canSubmit || isRedirecting) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Création en cours...
                                    </>
                                ) : isRedirecting ? 'Redirection...' : 'Créer mon compte'}
                            </button>
                        </div>
                    </form>

                    {/* process explainer */}
                    {!isRedirecting && (
                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Processus d'inscription</span>
                                </div>
                            </div>
                            <div className="mt-4 text-xs text-gray-500 space-y-1">
                                <p>1️⃣ Création de votre compte utilisateur</p>
                                <p>2️⃣ Connexion automatique</p>
                                <p>3️⃣ Redirection vers votre espace personnel</p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}