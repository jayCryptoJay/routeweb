/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState } from "react";
import { LocateFixed } from "lucide-react";
import { Map, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { MapWrapper } from "@/components/MapConfig";

interface LiveRouteMapProps {
  destination: {
    lat?: number | null;
    lng?: number | null;
    address: string;
  };
}

function RouteDisplay({ destination, onStatusChange }: { destination: any; onStatusChange: (status: 'locating' | 'error' | 'ok', error?: string) => void }) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map) return;
    
    if (!navigator.geolocation) {
      onStatusChange('error', "Geolocation not supported");
      return;
    }

    onStatusChange('locating');

    const dest: string | google.maps.routes.Waypoint = destination.lat != null && destination.lng != null
      ? { location: { lat: destination.lat, lng: destination.lng } }
      : destination.address;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const origin = {
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
        };

        // Clear previous route
        polylinesRef.current.forEach((p: google.maps.Polyline) => p.setMap(null));

        routesLib.Route.computeRoutes({
          origin,
          destination: dest,
          travelMode: 'DRIVING' as any,
          fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
        }).then(({ routes }: any) => {
          onStatusChange('ok');
          if (routes?.[0]) {
            const newPolylines = routes[0].createPolylines();
            newPolylines.forEach((p: google.maps.Polyline) => {
              p.setOptions({
                strokeColor: "#38bdf8",
                strokeOpacity: 0.8,
                strokeWeight: 6,
              });
              p.setMap(map);
            });
            polylinesRef.current = newPolylines;
            if (routes[0].viewport) map.fitBounds(routes[0].viewport);
          } else {
             onStatusChange('error', "Could not find a route.");
          }
        }).catch((err: any) => {
          onStatusChange('error', "Could not find a route.");
          console.error(err);
        });
      },
      (error) => {
        onStatusChange('error', "Could not get current location.");
        console.error("Geolocation error:", error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60_000 }
    );

    return () => polylinesRef.current.forEach((p: google.maps.Polyline) => p.setMap(null));
  }, [routesLib, map, destination]);

  return null;
}

export function LiveRouteMap({ destination }: LiveRouteMapProps) {
  const [locating, setLocating] = useState(true);
  const [routeError, setRouteError] = useState<string | null>(null);

  const handleStatusChange = (status: 'locating' | 'error' | 'ok', error?: string) => {
    if (status === 'locating') {
      setLocating(true);
      setRouteError(null);
    } else if (status === 'error') {
      setLocating(false);
      setRouteError(error || "Unknown error");
    } else {
      setLocating(false);
      setRouteError(null);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-sky-400/20 shadow-xl shadow-sky-950/20">
      <MapWrapper>
        <Map
          defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
          defaultZoom={14}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '280px' }}
          disableDefaultUI={true}
        >
          <RouteDisplay destination={destination} onStatusChange={handleStatusChange} />
        </Map>
      </MapWrapper>

      {locating && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#05070b]/60 backdrop-blur-sm">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-300 border-t-transparent" />
          <p className="mt-2 text-xs font-bold text-sky-300">Finding route...</p>
        </div>
      )}
      {routeError && !locating && (
        <div className="absolute top-2 left-2 right-2 z-10 rounded-xl bg-black/80 px-3 py-2 text-center text-xs text-amber-300 backdrop-blur">
          {routeError}
        </div>
      )}
    </div>
  );
}
