export type Product = {
    id: string;
    title: string;
    category: string;
    priceMGA: number;
    ref: string;
    img: string;
    createdAt?: string; // ISO date (optionnel)
};


export const fmtMGA = (v: number) =>
    new Intl.NumberFormat("fr-MG", {
        style: "currency",
        currency: "MGA",
        maximumFractionDigits: 0,
    }).format(v);