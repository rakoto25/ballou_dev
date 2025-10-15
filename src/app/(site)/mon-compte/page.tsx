'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    testApiConnection,
    getAccount,
    updateAccount,
    logoutUser,
    type AccountData,
} from '@/lib/account'

type TabKey = 'overview' | 'profile' | 'addresses' | 'orders'

export default function AccountPage() {
    const router = useRouter()
    const [account, setAccount] = useState<AccountData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [loggingOut, setLoggingOut] = useState(false)

    // UI state
    const [activeTab, setActiveTab] = useState<TabKey>('overview')
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

    // Local editable copies
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        email: '',
    })

    const emptyAddress = {
        company: '',
        first_name: '',
        last_name: '',
        address_1: '',
        address_2: '',
        postcode: '',
        city: '',
        country: '',
        phone: '',
    }
    const [billing, setBilling] = useState<Record<string, any>>(emptyAddress)
    const [shipping, setShipping] = useState<Record<string, any>>(emptyAddress)

    useEffect(() => {
        const init = async () => {
            const apiTest = await testApiConnection()
            if (!apiTest.success) {
                setError('Service API indisponible. Veuillez réessayer plus tard.')
                setLoading(false)
                return
            }

            // (Avec proxy Next, pas besoin d’attendre les cookies)
            const res = await getAccount()
            if (res.success) {
                const a = res as AccountData
                setAccount(a)
                setProfile({
                    first_name: a.first_name ?? '',
                    last_name: a.last_name ?? '',
                    email: a.email ?? '',
                })
                setBilling({ ...emptyAddress, ...(a.billing ?? {}) })
                setShipping({ ...emptyAddress, ...(a.shipping ?? {}) })
                setLoading(false)
            } else {
                router.push('/connexion?message=session-expired')
            }
        }
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleLogout = async () => {
        if (loggingOut) return
        if (!confirm('Voulez-vous vraiment vous déconnecter ?')) return
        setLoggingOut(true)
        await logoutUser()
        router.push('/connexion')
    }

    const initials = useMemo(() => {
        const f = (profile.first_name || account?.first_name || '').trim()
        const l = (profile.last_name || account?.last_name || '').trim()
        const i = `${f?.[0] ?? ''}${l?.[0] ?? ''}`.toUpperCase()
        return i || (account?.username?.[0]?.toUpperCase() ?? 'U')
    }, [account, profile])

    const validateProfile = () => {
        if (!profile.first_name?.trim()) return 'Le prénom est requis.'
        if (!profile.last_name?.trim()) return 'Le nom est requis.'
        if (!profile.email?.trim()) return "L'email est requis."
        // basique
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) return 'Email invalide.'
        return null
    }

    const saveAll = async () => {
        if (!account) return
        const profileErr = validateProfile()
        if (profileErr) {
            setToast({ type: 'error', text: profileErr })
            return
        }

        setSaving(true)
        setToast({ type: 'info', text: 'Enregistrement en cours…' })

        // Optimistic UI: snapshot
        const prev = { account, profile: { ...profile }, billing: { ...billing }, shipping: { ...shipping } }

        try {
            // Build payload compatible avec /update (WP)
            const payload: any = {
                first_name: profile.first_name.trim(),
                last_name: profile.last_name.trim(),
                email: profile.email.trim(),
                billing: billing,
                shipping: shipping,
            }

            // Optimistic local merge
            const merged: AccountData = {
                ...account,
                first_name: payload.first_name,
                last_name: payload.last_name,
                email: payload.email,
                billing: { ...(account.billing ?? {}), ...(payload.billing ?? {}) },
                shipping: { ...(account.shipping ?? {}), ...(payload.shipping ?? {}) },
            }
            setAccount(merged)

            const res = await updateAccount(payload)
            if (!res.success) {
                // rollback
                setAccount(prev.account)
                setToast({ type: 'error', text: res.message ?? 'Échec de la mise à jour.' })
                return
            }

            setToast({ type: 'success', text: 'Vos informations ont été mises à jour.' })
        } catch (e) {
            // rollback
            setAccount(prev.account)
            setToast({ type: 'error', text: 'Erreur réseau ou serveur.' })
        } finally {
            setSaving(false)
            // Auto-hide toast
            setTimeout(() => setToast(null), 3000)
        }
    }

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-gray-200 rounded w-40" />
                    <div className="h-24 bg-gray-200 rounded" />
                    <div className="h-64 bg-gray-200 rounded" />
                </div>
            </div>
        )
    }

    if (error) {
        return <p className="text-red-600 text-center mt-12">{error}</p>
    }

    if (!account) return null

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-[#29235c] text-white grid place-items-center text-xl font-bold shadow">
                        {initials}
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#e94e1a]">Mon compte</h1>
                        <p className="text-sm text-gray-600">
                            Connecté en tant que <span className="font-medium">{account.username}</span>
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className={`px-4 py-2 rounded text-white shadow transition ${loggingOut ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                        }`}
                >
                    {loggingOut ? 'Déconnexion…' : 'Déconnexion'}
                </button>
            </div>

            {/* Tabs */}
            <div className="mt-6 border-b border-gray-200">
                <nav className="-mb-px flex flex-wrap gap-4">
                    {[
                        { key: 'overview', label: 'Aperçu' },
                        { key: 'profile', label: 'Profil' },
                        { key: 'addresses', label: 'Adresses' },
                        { key: 'orders', label: 'Commandes' },
                    ].map(t => (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key as TabKey)}
                            className={`border-b-2 px-2 py-2 text-sm sm:text-base -mb-px transition ${activeTab === (t.key as TabKey)
                                ? 'border-[#e94e1a] text-[#e94e1a] font-semibold'
                                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-200'
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Toast */}
            {toast && (
                <div
                    className={`mt-4 rounded-md border p-3 text-sm ${toast.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : toast.type === 'error'
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-blue-50 border-blue-200 text-blue-700'
                        }`}
                >
                    {toast.text}
                </div>
            )}

            {/* Content */}
            <div className="mt-6 grid gap-6">
                {activeTab === 'overview' && (
                    <section className="grid gap-6 md:grid-cols-2">
                        {/* Carte Profil */}
                        <div className="rounded-xl bg-white/90 shadow-sm border p-5">
                            <h2 className="text-lg font-semibold mb-3">Profil</h2>
                            <div className="text-sm text-gray-700 space-y-1">
                                <p><span className="text-gray-500">Nom :</span> {account.last_name || <em className="text-gray-400">—</em>}</p>
                                <p><span className="text-gray-500">Prénom :</span> {account.first_name || <em className="text-gray-400">—</em>}</p>
                                <p><span className="text-gray-500">Email :</span> {account.email}</p>
                            </div>
                            <div className="mt-4">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className="inline-flex items-center gap-2 rounded-md bg-[#e94e1a] text-white px-4 py-2 hover:bg-[#d43e0f] transition"
                                >
                                    Modifier
                                </button>
                            </div>
                        </div>

                        {/* Carte Statuts */}
                        <div className="rounded-xl bg-white/90 shadow-sm border p-5">
                            <h2 className="text-lg font-semibold mb-3">Activité</h2>
                            <div className="flex items-center gap-6 text-sm">
                                <div>
                                    <div className="text-2xl font-bold">{account.orders_count ?? account.recent_orders?.length ?? 0}</div>
                                    <div className="text-gray-500">Commandes récentes</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{(account.billing?.phone || '').toString().length > 3 ? '✔' : '—'}</div>
                                    <div className="text-gray-500">Téléphone renseigné</div>
                                </div>
                            </div>
                        </div>

                        {/* Adresses compact */}
                        <div className="rounded-xl bg-white/90 shadow-sm border p-5 md:col-span-2">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">Adresses</h2>
                                <button
                                    onClick={() => setActiveTab('addresses')}
                                    className="text-[#e94e1a] hover:underline text-sm"
                                >
                                    Modifier les adresses
                                </button>
                            </div>
                            <div className="grid gap-6 sm:grid-cols-2 mt-4 text-sm">
                                <AddressPreview title="Facturation" data={account.billing} />
                                <AddressPreview title="Livraison" data={account.shipping} />
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'profile' && (
                    <section className="rounded-xl bg-white/90 shadow-sm border p-5">
                        <h2 className="text-lg font-semibold mb-1">Profil</h2>
                        <p className="text-sm text-gray-500 mb-4">Mettez à jour vos informations personnelles.</p>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <TextField
                                label="Prénom *"
                                value={profile.first_name}
                                onChange={v => setProfile(s => ({ ...s, first_name: v }))}
                            />
                            <TextField
                                label="Nom *"
                                value={profile.last_name}
                                onChange={v => setProfile(s => ({ ...s, last_name: v }))}
                            />
                            <TextField
                                className="sm:col-span-2"
                                label="Adresse email *"
                                type="email"
                                value={profile.email}
                                onChange={v => setProfile(s => ({ ...s, email: v }))}
                            />
                        </div>

                        <div className="mt-5 flex items-center gap-3">
                            <button
                                onClick={saveAll}
                                disabled={saving}
                                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-white shadow transition ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#29235c] hover:brightness-110'
                                    }`}
                            >
                                {saving ? 'Enregistrement…' : 'Enregistrer'}
                            </button>
                            <button
                                onClick={() => {
                                    // reset depuis l’état account
                                    if (!account) return
                                    setProfile({
                                        first_name: account.first_name ?? '',
                                        last_name: account.last_name ?? '',
                                        email: account.email ?? '',
                                    })
                                    setToast({ type: 'info', text: 'Modifications annulées.' })
                                    setTimeout(() => setToast(null), 2000)
                                }}
                                className="text-sm text-gray-600 hover:underline"
                            >
                                Annuler
                            </button>
                        </div>
                    </section>
                )}

                {activeTab === 'addresses' && (
                    <section className="rounded-xl bg-white/90 shadow-sm border p-5">
                        <h2 className="text-lg font-semibold mb-1">Adresses</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Mettez à jour vos adresses de facturation et de livraison.
                        </p>
                        <div className="grid gap-6 md:grid-cols-2">
                            <AddressForm
                                title="Adresse de facturation"
                                data={billing}
                                onChange={setBilling}
                            />
                            <AddressForm
                                title="Adresse de livraison"
                                data={shipping}
                                onChange={setShipping}
                            />
                        </div>

                        <div className="mt-5 flex items-center gap-3">
                            <button
                                onClick={saveAll}
                                disabled={saving}
                                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-white shadow transition ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#29235c] hover:brightness-110'
                                    }`}
                            >
                                {saving ? 'Enregistrement…' : 'Enregistrer les adresses'}
                            </button>
                            <button
                                onClick={() => {
                                    if (!account) return
                                    setBilling({ ...emptyAddress, ...(account.billing ?? {}) })
                                    setShipping({ ...emptyAddress, ...(account.shipping ?? {}) })
                                    setToast({ type: 'info', text: 'Modifications annulées.' })
                                    setTimeout(() => setToast(null), 2000)
                                }}
                                className="text-sm text-gray-600 hover:underline"
                            >
                                Annuler
                            </button>
                        </div>
                    </section>
                )}

                {activeTab === 'orders' && (
                    <section className="rounded-xl bg-white/90 shadow-sm border p-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Commandes récentes</h2>
                            <Link href="/mon-compte/commandes" className="text-sm text-[#e94e1a] hover:underline">
                                Voir toutes les commandes
                            </Link>
                        </div>

                        {account.recent_orders && account.recent_orders.length > 0 ? (
                            <div className="mt-4 overflow-x-auto rounded-lg border">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#29235c] text-white">
                                        <tr>
                                            <th className="px-4 py-2">#</th>
                                            <th className="px-4 py-2">Date</th>
                                            <th className="px-4 py-2">Statut</th>
                                            <th className="px-4 py-2">Total</th>
                                            <th className="px-4 py-2">Détail</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {account.recent_orders.map((o: any) => (
                                            <tr key={o.order_id} className="even:bg-gray-50">
                                                <td className="px-4 py-2 font-medium">#{o.order_number}</td>
                                                <td className="px-4 py-2">{formatDate(o.date)}</td>
                                                <td className="px-4 py-2">{StatusBadge(o.status)}</td>
                                                <td className="px-4 py-2">{formatMoney(o.total, o.currency)}</td>
                                                <td className="px-4 py-2">
                                                    <Link href={`/mon-compte/commande/${o.order_id}`} className="text-[#e94e1a] hover:underline">
                                                        Voir
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState
                                title="Aucune commande"
                                text="Vous n'avez pas encore passé de commande."
                                cta={<Link href="/" className="inline-block mt-3 text-[#e94e1a] hover:underline">Commencer mes achats</Link>}
                            />
                        )}
                    </section>
                )}
            </div>
        </div>
    )
}

/* ---------- UI bits ---------- */

function TextField({
    label,
    value,
    onChange,
    type = 'text',
    className = '',
    placeholder,
}: {
    label: string
    value: string
    onChange: (v: string) => void
    type?: string
    className?: string
    placeholder?: string
}) {
    return (
        <label className={`block ${className}`}>
            <span className="block text-sm text-gray-700 mb-1">{label}</span>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#e94e1a] focus:ring-2 focus:ring-[#e94e1a]/20 transition"
            />
        </label>
    )
}

function AddressForm({
    title,
    data,
    onChange,
}: {
    title: string
    data: Record<string, any>
    onChange: (next: Record<string, any>) => void
}) {
    const set = (k: string, v: string) => onChange({ ...data, [k]: v })

    return (
        <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-3">{title}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Société" value={data.company ?? ''} onChange={(v) => set('company', v)} />
                <TextField label="Téléphone" value={data.phone ?? ''} onChange={(v) => set('phone', v)} />
                <TextField label="Prénom" value={data.first_name ?? ''} onChange={(v) => set('first_name', v)} />
                <TextField label="Nom" value={data.last_name ?? ''} onChange={(v) => set('last_name', v)} />
                <TextField label="Adresse 1" value={data.address_1 ?? ''} onChange={(v) => set('address_1', v)} className="sm:col-span-2" />
                <TextField label="Adresse 2" value={data.address_2 ?? ''} onChange={(v) => set('address_2', v)} className="sm:col-span-2" />
                <TextField label="Code postal" value={data.postcode ?? ''} onChange={(v) => set('postcode', v)} />
                <TextField label="Ville" value={data.city ?? ''} onChange={(v) => set('city', v)} />
                <TextField label="Pays" value={data.country ?? ''} onChange={(v) => set('country', v)} className="sm:col-span-2" />
            </div>
        </div>
    )
}

function AddressPreview({ title, data }: { title: string; data?: Record<string, any> | null }) {
    if (!data) {
        return (
            <div className="rounded-md border p-4">
                <div className="text-sm text-gray-500">
                    <div className="font-semibold mb-1">{title}</div>
                    <em className="text-gray-400">Aucune adresse renseignée.</em>
                </div>
            </div>
        )
    }
    return (
        <div className="rounded-md border p-4 text-sm">
            <div className="font-semibold mb-1">{title}</div>
            <div className="space-y-1">
                <p className="font-medium">
                    {data.company ? `${data.company}, ` : ''}
                    {data.first_name} {data.last_name}
                </p>
                <p>
                    {data.address_1}
                    {data.address_2 ? `, ${data.address_2}` : ''}
                </p>
                <p>
                    {data.postcode} {data.city}
                    {data.country ? `, ${data.country}` : ''}
                </p>
                {data.phone && <p className="text-gray-600">Tél. {data.phone}</p>}
            </div>
        </div>
    )
}

function EmptyState({ title, text, cta }: { title: string; text: string; cta?: React.ReactNode }) {
    return (
        <div className="rounded-lg border border-dashed p-8 text-center">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{text}</p>
            {cta}
        </div>
    )
}

function StatusBadge(status: string) {
    const s = (status || '').toLowerCase()
    const map: Record<string, string> = {
        completed: 'bg-green-100 text-green-700 border-green-200',
        processing: 'bg-blue-100 text-blue-700 border-blue-200',
        pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
        refunded: 'bg-purple-100 text-purple-700 border-purple-200',
        failed: 'bg-red-100 text-red-700 border-red-200',
        onhold: 'bg-orange-100 text-orange-700 border-orange-200',
    }
    const cls = map[s] ?? 'bg-gray-100 text-gray-700 border-gray-200'
    return <span className={`inline-block text-xs rounded-full px-2 py-1 border capitalize ${cls}`}>{s || '—'}</span>
}

function formatDate(isoLike: string) {
    const d = new Date(isoLike)
    if (Number.isNaN(d.getTime())) return isoLike
    return d.toLocaleString()
}

function formatMoney(amount: number | string, currency?: string) {
    const n = typeof amount === 'string' ? Number(amount) : amount
    if (Number.isNaN(n)) return `${amount} ${currency ?? ''}`.trim()
    try {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: (currency || 'EUR') as any }).format(n)
    } catch {
        return `${n.toFixed(2)} ${currency ?? ''}`.trim()
    }
}
