'use client';
import Link from "next/link";
import { useCart } from "./(site)/CartProvider";

export function CartLink({ CartIcon }: { CartIcon: React.ComponentType<{ className?: string }> }) {
    const { count } = useCart();
    return (
        <Link
            href="/panier"
            className="relative inline-flex items-center gap-2 rounded-full px-3 py-2 hover:bg-white/10 hover:text-white transition"
        >
            <CartIcon className="h-5 w-5 text-white/80" />
            <span className="hidden sm:inline">Panier</span>
            <span className="absolute -right-1 -top-1 rounded-full bg-[#e94e1a] px-1.5 text-[10px] font-bold text-white">
                {count}
            </span>
        </Link>
    );
}