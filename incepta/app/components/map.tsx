"use client";

import * as React from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "../supabase";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface Scam {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: string;
  ai_summary: string;
  votes: number;
  user_id: string;
}
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

function MapboxMap() {
  const { user } = useUser();
  const router = useRouter();
  if (!user) {
    alert("Please sign in to use the map")
    router.push("/")
  }

  const mapContainer = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<mapboxgl.Map | null>(null);
  const [scamMarkers, setScamMarkers] = React.useState<mapboxgl.Marker[]>([]);
  const [selectedLocation, setSelectedLocation] = React.useState<{ lat: number; lng: number } | null>(null);

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
        .addTo(mapRef.current!);
      
      marker.getElement().addEventListener("click", () => {
        setSelectedLocation({ lat: scam.lat, lng: scam.lng });
      });

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

  return (
    <>
      <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />
      {selectedLocation && (
        <div className="fixed top-0 right-0 h-full w-full sm:w-[26rem] bg-white shadow-xl z-20 border-l border-gray-200 transition-transform duration-300 ease-in-out">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Scams at this location
            </h2>
            <button
              onClick={() => setSelectedLocation(null)}
              className="text-gray-400 hover:text-red-500 text-2xl leading-none hover:cursor-pointer"
              aria-label="Close sidebar"
            >
              &times;
            </button>
          </div>
          <div className="overflow-y-auto h-[calc(100%-4rem)] px-5 py-4 space-y-4">
            <ScamList lat={selectedLocation.lat} lng={selectedLocation.lng} />
          </div>
        </div>
      )}
    </>
  );
}

export default MapboxMap;

function ScamList({ lat, lng }: { lat: number; lng: number }) {
  const [scams, setScams] = React.useState<Scam[]>([]);
  const [expandedScamId, setExpandedScamId] = React.useState<string | null>(null); 

  React.useEffect(() => {
    const fetchScams = async () => {
      const { data, error } = await supabase
        .from("scams")
        .select("*")
        .eq("lat", lat)
        .eq("lng", lng)
        .order("votes", { ascending: false })
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Error fetching scams:", error);
        return;
      }

      setScams(data);
    };

    fetchScams();
  }, [lat, lng]);

  const handleUpvote = async (scamId: string) => {
    const { error } = await supabase.rpc("increment_votes", { scam_id: scamId });
  
    if (error) {
      console.error("Upvote failed:", error);
    }
  };

  return (
    <div className="space-y-4">
      {scams.map((scam: Scam) => {
        const isExpanded = expandedScamId === scam.id; // Compare with string
        return (
          <div
            key={scam.id}
            className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={() => setExpandedScamId(isExpanded ? null : scam.id)} // Update with string id
          >
            <div className="flex justify-between items-center px-4 py-3">
              <p className="text-sm text-gray-800 font-medium flex-1">{scam.ai_summary}</p>
              <div className="flex justify-around items-center text-sm text-gray-700">
                <span>👍 {scam.votes}</span>
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => handleUpvote(scam.id)}
                >
                  Upvote
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="px-4 pb-4 text-sm text-gray-700 space-y-1">
                <div>
                  <span className="font-medium text-gray-600">Title:</span> {scam.title}
                </div>
                <div>
                  <span className="font-medium text-gray-600">Type:</span> {scam.type.replaceAll("_", " ")}
                </div>
                <div>
                  <span className="font-medium text-gray-600">Reported:</span>{" "}
                  {new Date(scam.timestamp).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium text-gray-600">Description:</span>
                  <p className="mt-1 text-gray-800 whitespace-pre-line">{scam.description}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {scams.length === 0 && (
        <p className="text-gray-500 text-sm text-center">No scams reported at this location.</p>
      )}
    </div>
  );
}