"use client";
import { useRouter } from "next/navigation";
import { startCheckout } from "../../api/cart/checkout/confirm/actions";

export default function PayButton({ payload }: { payload: any }) {
    const router = useRouter();
    const onClick = async () => {
        const o = await startCheckout(payload);
        router.push(`/checkout/paiement?order=${o.order_id}&key=${o.order_key}&method=${payload.payment_method}`);
    };
    return (
        <button onClick={onClick} className="px-5 py-3 rounded-xl bg-[#e94e1a] text-white">
            Payer maintenant
        </button>
    );
}