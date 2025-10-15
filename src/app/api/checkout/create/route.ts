import { NextRequest, NextResponse } from "next/server";
import { createCheckoutOrder, CheckoutCreateRequest } from "@/lib/ballou";

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as CheckoutCreateRequest;

        // (Optionnel) Sécurité côté API: refuse si pas de lignes
        if (!body?.lines?.length) {
            return NextResponse.json(
                { error: "no_lines", message: "Aucune ligne de commande." },
                { status: 400 }
            );
        }

        const data = await createCheckoutOrder(body);
        return NextResponse.json(data, { status: 200 });
    } catch (e: any) {
        const raw = String(e?.message ?? "");

        // Récupère le status HTTP de l'erreur backend si présent
        const statusMatch = /Checkout API error\s+(\d{3})\b/.exec(raw);
        const fallbackStatus = statusMatch ? parseInt(statusMatch[1], 10) : 500;

        // Essaie d’extraire le JSON backend après le ":"
        let backend: any = null;
        try {
            const jsonPartMatch = raw.match(/Checkout API error\s+\d{3}:\s*(\{[\s\S]*\})$/);
            if (jsonPartMatch?.[1]) backend = JSON.parse(jsonPartMatch[1]);
        } catch {
            // ignore
        }

        // Mapping d’erreurs connues
        if (backend?.error === "out_of_stock") {
            return NextResponse.json(
                {
                    error: "out_of_stock",
                    message: backend?.message || "Un ou plusieurs produits sont indisponibles.",
                },
                { status: 409 } // Conflict → indique au front de corriger le panier
            );
        }

        if (backend?.error === "validation_error") {
            return NextResponse.json(
                { error: "validation_error", message: backend?.message || "Données invalides." },
                { status: 422 }
            );
        }

        // Par défaut, on renvoie ce qu’on a
        return NextResponse.json(
            { error: "create_failed", message: backend?.message || e?.message || "Unknown error" },
            { status: fallbackStatus || 500 }
        );
    }
}