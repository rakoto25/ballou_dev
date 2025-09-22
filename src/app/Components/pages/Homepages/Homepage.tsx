import Hero from "../../Heros";
import BestsellersClient from "./BestsellersClient";
import OurSelects from "./OurSelects";

export default function Homepage() {
    return (
        <>
            <Hero />
            <BestsellersClient />
            <OurSelects />
        </>
    );
}