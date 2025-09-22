"use client";
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// icônes copiées dans /public/leaflet/ depuis node_modules/leaflet/dist/images/
const defaultIcon = L.icon({
    iconUrl: "/leaflet/marker-icon.png",
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    shadowUrl: "/leaflet/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

export interface MapLeafletProps {
    center?: [number, number];
    zoom?: number;
    title?: string;
    brandPrimary?: string;
}

export default function MapLeaflet({
    center = [-18.8792, 47.5079],
    zoom = 13,
    title = "Nous trouver",
    brandPrimary = "#e94e1a",
}: MapLeafletProps) {
    return (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <h3 className="mb-4 text-lg font-extrabold tracking-tight" style={{ color: brandPrimary }}>
                {title}
            </h3>
            <div className="overflow-hidden rounded-3xl border border-zinc-200 shadow-sm dark:border-zinc-800">
                <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-80 w-full">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={center} icon={defaultIcon}>
                        <Popup>
                            <div className="text-sm">
                                <strong>Ballou</strong>
                                <div>Rue Exemple, Antananarivo</div>
                            </div>
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>
        </section>
    );
}