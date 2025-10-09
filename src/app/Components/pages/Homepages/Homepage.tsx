import Hero from "../../Heros";
import BestsellersClient from "./BestsellersClient";
import CategoryList from "./CategoryList";  // Remplacer CategoryCard par CategoryList
import OurSelects from "./OurSelects";

export default function Homepage() {
    return (
        <>
            <Hero />
            <BestsellersClient />
            <OurSelects />
            <CategoryList />  {/* Remplacer CategoryCard par CategoryList */}
        </>
    );
}