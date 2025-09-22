"use client";
import dynamic from "next/dynamic";

// On désactive le SSR ici (dans un composant client)
const MapLeaflet = dynamic(() => import("./MapLeaflet"), { ssr: false });

export type MapLeafletProps = React.ComponentProps<typeof MapLeaflet>;

export default function MapLeafletClient(props: MapLeafletProps) {
    return <MapLeaflet {...props} />;
}