export type ProductListCard = {
    id: string;
    title: string;
    category: string;
    priceMGA: number;
    ref: string;
    img: string;
    slug?: string; // 👈 ajoute un slug sur les items de la grille
};

// formateur MGA
export const fmtMGA = (v: number) =>
    new Intl.NumberFormat("fr-MG", {
        style: "currency",
        currency: "MGA",
        maximumFractionDigits: 0,
    }).format(v);

// helper de slug cohérent
export const toSlug = (p: { slug?: string; title?: string; ref?: string }) => {
    if (p.slug) return p.slug;
    const src = (p.title || p.ref || "").trim();
    return src
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};
