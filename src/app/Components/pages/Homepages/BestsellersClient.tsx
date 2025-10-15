"use client";

import * as React from "react";

// ✅ Importe le composant dynamique par son *vrai* nom de fichier
//    Assure-toi que le fichier s'appelle exactement "Bestsellers.tsx"
// import Bestsellers from "./Bestsellers";
import Bestsellers from "./BestSeller";

export default function BestsellersClient() {
    // plus d’import STATIC_BESTSELLERS, plus de types fantômes
    // le composant Bestsellers gère lui-même l’ajout au panier et le fetch
    return <Bestsellers />;
}