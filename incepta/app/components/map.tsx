"use client";

import * as React from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "../supabase";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

function MapboxMap() {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<mapboxgl.Map | null>(null);
  const [scamMarkers, setScamMarkers] = React.useState<mapboxgl.Marker[]>([]);

  async function loadScams() {
    const { data, error } = await supabase.from("scams").select("*");

    if (error) {
      console.error("Failed to fetch scams:", error);
      return;
    }

    scamMarkers.forEach((marker) => marker.remove());

    const newMarkers = data.map((scam: any) => {
      const marker = new mapboxgl.Marker({ color: "orange" })
        .setLngLat([scam.lng, scam.lat])
        .setPopup(new mapboxgl.Popup().setText(scam.description || "Scam reported here"))
        .addTo(mapRef.current!);

      return marker;
    });

    setScamMarkers(newMarkers);
  }

  React.useEffect(() => {
    if (!mapContainer.current) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const map = new mapboxgl.Map({
          container: mapContainer.current!,
          style: "mapbox://styles/mapbox/streets-v11",
          center: [longitude, latitude],
          zoom: 13,
        });

        mapRef.current = map;

        new mapboxgl.Marker({ color: "blue" })
          .setLngLat([longitude, latitude])
          .setPopup(new mapboxgl.Popup().setText("You are here"))
          .addTo(map);
        
        await loadScams();

        supabase
          .channel("realtime:scams")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "scams" },
            async () => {
              await loadScams(); 
            }
          )
          .subscribe();
      },
      (err) => {
        console.error("Geolocation failed:", err);
        alert("Please allow location access for the map to show your position.");
      }
    );

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
}

export default MapboxMap;