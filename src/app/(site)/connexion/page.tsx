'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser, testApiConnection, type ApiResponse } from '@/lib/account';

type LoginResult = ApiResponse;

/* Component */
export default function LoginPage() {
    const router = useRouter();
    const userRef = useRef<HTMLInputElement | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
    const [message, setMessage] = useState<{ type: 'error' | 'info' | 'success'; text: string } | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [apiConnected, setApiConnected] = useState<boolean | null>(null);

    useEffect(() => {
        userRef.current?.focus();
        (async () => {
            try {
                if (typeof testApiConnection === 'function') {
                    const res = await testApiConnection();
                    setApiConnected(!!res?.success);
                    if (!res?.success) setMessage({ type: 'error', text: 'Impossible de contacter l’API. Réessayez plus tard.' });
                } else {
                    setApiConnected(true);
                }
            } catch {
                setApiConnected(false);
                setMessage({ type: 'error', text: 'Erreur de connexion à l’API.' });
            }
        })();

        return () => {
            abortRef.current?.abort();
        };
    }, []);

    const validate = () => {
        const errs: typeof errors = {};
        if (!username.trim()) errs.username = 'Nom d’utilisateur requis';
        if (!password) errs.password = 'Mot de passe requis';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (isLoading) return;
        if (!validate()) {
            setMessage({ type: 'error', text: 'Corrigez les champs en erreur.' });
            return;
        }
        if (apiConnected === false) {
            setMessage({ type: 'error', text: 'Service indisponible.' });
            return;
        }

        abortRef.current?.abort();
        abortRef.current = new AbortController();
        const signal = abortRef.current.signal;

        setIsLoading(true);
        try {
            const res: LoginResult = await loginUser(username.trim(), password);
            if (signal.aborted) return;

            if (res.success) {
                setMessage({ type: 'success', text: 'Connexion réussie — redirection...' });
                // slight delay for UX / cookie set propagation
                setTimeout(() => router.push('/mon-compte'), 250);
            } else {
                // map frequent errors (backend shape: { error, message, status })
                const msg = (res as any).message || 'Échec de la connexion.';
                if ((res as any).status === 401 || (res as any).error === 'invalid_credentials') {
                    setErrors({ username: undefined, password: 'Identifiants invalides' });
                    setMessage({ type: 'error', text: 'Nom d’utilisateur ou mot de passe invalide.' });
                } else {
                    setMessage({ type: 'error', text: msg });
                }
            }
        } catch (err: any) {
            if (signal.aborted) {
                console.warn('Login aborted');
                return;
            }
            console.error('Login error', err);
            setMessage({ type: 'error', text: 'Erreur réseau. Vérifiez votre connexion.' });
        } finally {
            setIsLoading(false);
        }
    };

    const inputBase = 'w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 transition';
    const inputClass = (field: 'username' | 'password') =>
        `${inputBase} ${errors[field] ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <h2 className="text-3xl font-extrabold text-gray-900">Connexion</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Pas encore de compte ?{' '}
                    <Link href="/inscription" className="font-medium text-blue-600 hover:text-blue-500">Créez-en un</Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow rounded-lg">
                    {message && (
                        <div className={`mb-4 p-3 rounded ${message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
                            <p className="text-sm">{message.text}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nom d’utilisateur *</label>
                            <div className="mt-1">
                                <input
                                    id="username"
                                    ref={userRef}
                                    type="text"
                                    autoComplete="username"
                                    value={username}
                                    onChange={e => { setUsername(e.target.value); setErrors(prev => ({ ...prev, username: undefined })); setMessage(null); }}
                                    className={inputClass('username')}
                                    disabled={isLoading}
                                />
                                {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe *</label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })); setMessage(null); }}
                                    className={inputClass('password')}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(s => !s)}
                                    className="absolute right-2 top-2 text-sm text-gray-500"
                                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                >
                                    {showPassword ? 'Masquer' : 'Afficher'}
                                </button>
                                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading || apiConnected === false}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded text-sm font-medium text-white transition ${isLoading || apiConnected === false ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'}`}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Connexion...
                                    </>
                                ) : 'Se connecter'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-xs text-gray-500">
                        <p>• Votre mot de passe est sécurisé et ne sera jamais partagé.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
