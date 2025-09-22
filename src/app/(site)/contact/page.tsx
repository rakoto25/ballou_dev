// page.tsx — Server Component (pas de "use client" ici)

// ✅ Default exports
import HeroContact from "@/app/Components/pages/Contact/HeroContact";
import ContactForm from "@/app/Components/pages/Contact/ContactForm";
import MapLeafletClient from "@/app/Components/pages/Contact/MapLeafletClient";

// ✅ Named export
import { ContactInfo } from "@/app/Components/pages/Contact/ContactInfo";

export const metadata = {
    title: "Contact | Ballou",
    description: "Contactez Ballou : formulaire, coordonnées, plan d'accès.",
};

export default function ContactPage() {
    const brandPrimary = "#e94e1a";
    const brandDark = "#29235c";

    return (
        <main>
            <HeroContact brandPrimary={brandPrimary} brandDark={brandDark} />

            <ContactInfo
                brandPrimary={brandPrimary}
                items={[
                    { label: "Téléphone", value: "+261 00 000 00", href: "tel:+2610000000" },
                    { label: "Email", value: "contact@ballou.com", href: "mailto:contact@ballou.com" },
                    { label: "Facebook", value: "facebook.com/ballou", href: "https://facebook.com/ballou" },
                    { label: "Adresse", value: "Rue Exemple, Antananarivo, MG" },
                ]}
            />

            <ContactForm brandPrimary={brandPrimary} brandDark={brandDark} />

            <MapLeafletClient brandPrimary={brandPrimary} center={[-18.8792, 47.5079]} zoom={13} />
        </main>
    );
}