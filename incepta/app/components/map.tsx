"use client"

import * as React from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function MapboxMap() {
  const mapNode = React.useRef(null);
  const [map, setMap] = React.useState<mapboxgl.Map | null>(null);

  React.useEffect(() => {
    const node = mapNode.current;
    if (typeof window === "undefined" || node === null) return;

    const defaultCenter: [number, number] = [-74.5, 40]; 

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        const mapboxMap = new mapboxgl.Map({
          container: node,
          accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN!,
          style: "mapbox://styles/mapbox/streets-v11",
          center: [longitude, latitude],
          zoom: 13,
        });

        setMap(mapboxMap);
      },
      (error) => {
        console.warn("Geolocation error:", error);
        
        const mapboxMap = new mapboxgl.Map({
          container: node,
          accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN!,
          style: "mapbox://styles/mapbox/streets-v11",
          center: defaultCenter,
          zoom: 9,
        });

        setMap(mapboxMap);
      }
    );

    return () => {
      if (map) map.remove();
    };
  }, []);

  return <div ref={mapNode} style={{ width: "100%", height: "100%" }} />;
}

export default MapboxMap;
