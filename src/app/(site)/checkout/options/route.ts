import { NextRequest, NextResponse } from "next/server";
import { fetchCheckoutOptions, CartLine, CartAddress } from "@/lib/ballou";

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        // lines=12:2,45:1
        const linesParam = url.searchParams.get("lines") || "";
        const lines: CartLine[] = linesParam
            ? linesParam.split(",").map((pair) => {
                const [id, qty] = pair.split(":").map((v) => parseInt(v || "1", 10));
                return { id, qty: Math.max(1, qty || 1) };
            })
            : [];

        const address: CartAddress & { address_1?: string; address_2?: string } = {
            country: url.searchParams.get("country") || "",
            state: url.searchParams.get("state") || "",
            postcode: url.searchParams.get("postcode") || "",
            city: url.searchParams.get("city") || "",
            address_1: url.searchParams.get("address_1") || "",
            address_2: url.searchParams.get("address_2") || "",
        };

        const data = await fetchCheckoutOptions({
            lines: lines.length ? lines : undefined,
            address,
        });
        return NextResponse.json(data, { status: 200 });
    } catch (e: any) {
        return NextResponse.json(
            { error: "options_failed", message: e?.message ?? "Unknown error" },
            { status: 500 }
        );
    }
}