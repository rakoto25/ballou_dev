"use client";
import React from "react";
import Link from "next/link";
import { BallouCategory } from "@/lib/ballou"; // Typage pour la catégorie

interface CategoryCardProps {
    category: BallouCategory;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
    if (!category || !category.name) {
        return null;
    }

    // On suppose que chaque catégorie a un `slug` ou `id` utilisable pour le lien
    const href = `/categorie/${category.slug || category.id}`;

    return (
        <Link href={href}>
            <span
                className="inline-block bg-[#29235c] text-[#e94e1a] font-semibold rounded-full 
                   px-4 py-2 text-sm md:text-base cursor-pointer select-none
                   opacity-75 hover:opacity-100 transition-all duration-300 
                   w-full max-w-[300px] text-center"
            >
                {category.name}
            </span>
        </Link>
    );
};

export default CategoryCard;