'use client';

import React, { useEffect, useState } from "react";
import CategoryCard from "./CategoryCard";
import { BallouCategory } from "@/lib/ballou";

const CategoryList: React.FC = () => {
    const [categories, setCategories] = useState<BallouCategory[]>([]);

    useEffect(() => {
        // Fonction pour récupérer les catégories populaires depuis l'API
        const fetchCategories = async () => {
            try {
                // Utilisation de l'URL de l'API REST WordPress
                const res = await fetch("http://localhost/ballou/wp-json/ballou/v1/categories");
                const data = await res.json();

                // Log pour vérifier la réponse complète
                console.log("Catégories récupérées : ", data);

                // Vérifie si les données existent et met-les à jour dans l'état
                if (data && data.items) {
                    // Filtrer la catégorie "Non classé"
                    const filteredCategories = data.items.filter(
                        (category: BallouCategory) => category.name !== "Non classé"
                    );
                    console.log("Catégories filtrées : ", filteredCategories);
                    setCategories(filteredCategories);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des catégories :", error);
            }
        };

        fetchCategories();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-start text-[#29235c] mb-6">Catégories Populaires</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {categories.slice(0, 20).map((category) => {
                    // Définir la largeur de la catégorie en fonction du texte
                    const categoryWidth = category.name.length > 20 ? 'auto' : '200px';

                    return (
                        <div key={category.id} className="w-full" style={{ minWidth: categoryWidth }}>
                            <CategoryCard category={category} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryList;