/// <reference types="@types/google.maps" />
import { useEffect, useMemo, useRef, useState } from "react";
import { LocateFixed, MapPinned, Navigation, Route as RouteIcon } from "lucide-react";
import { useLocation } from "wouter";
import { Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { MapWrapper } from "@/components/MapConfig";
import DirectionsPanel from "@/components/DirectionsPanel";
import { trpc } from "@/lib/trpc";
import { pinColor } from "@/lib/route-utils";
import { triggerHaptic } from "@/lib/mobile-utils";
import { useRouteId } from "@/_core/hooks/useRouteId";

function MarkersAndLines({ locatedStops, stopsData, selectedId, setSelectedId }: any) {
  const map = useMap();
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !locatedStops.length) return;

    const path = locatedStops.map((stop: any) => ({ lat: stop.lat as number, lng: stop.lng as number }));
    if (path.length > 1) {
      const line = new google.maps.Polyline({
        map,
        path,
        geodesic: true,
        strokeColor: "#38bdf8",
        strokeOpacity: 0,
        strokeWeight: 4,
        icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 4 }, offset: "0", repeat: "16px" }],
      });
      setPolyline(line);

      const bounds = new google.maps.LatLngBounds();
      path.forEach((point: any) => bounds.extend(point));
      map.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 });
      
      return () => {
        line.setMap(null);
      }
    }
  }, [map, locatedStops]);

  useEffect(() => {
    if (map && selectedId) {
      const stop = locatedStops.find((s: any) => s.id === selectedId);
      if (stop) {
        map.panTo({ lat: stop.lat as number, lng: stop.lng as number });
      }
    }
  }, [map, selectedId, locatedStops]);

  return (
    <>
      {locatedStops.map((stop: any) => {
        const isNext = stop.status === "pending" && stop.sequenceNumber === stopsData.find((item: any) => item.status === "pending")?.sequenceNumber;
        
        const pinStyles: React.CSSProperties = {
          width: isNext ? "34px" : "28px",
          height: isNext ? "34px" : "28px",
          borderRadius: "999px",
          display: "grid",
          placeItems: "center",
          background: pinColor(stop.status, isNext),
          color: "#06111d",
          fontWeight: "900",
          fontSize: isNext ? "12px" : "10px",
          border: isNext ? "3px solid #fff" : "2px solid rgba(255,255,255,.75)",
          boxShadow: isNext ? "0 0 0 6px rgba(251,191,36,.22), 0 4px 16px rgba(0,0,0,.35)" : "0 3px 10px rgba(0,0,0,.35)",
        };

        return (
          <AdvancedMarker
            key={stop.id}
            position={{ lat: stop.lat as number, lng: stop.lng as number }}
            title={stop.address}
            onClick={() => {
              triggerHaptic("tap");
              setSelectedId(stop.id);
            }}
          >
            <div style={pinStyles} title={stop.address}>
              {stop.sequenceNumber}
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
}

export default function MapPage() {
  const [location] = useLocation();
  const { routeId } = useRouteId();
  const queryStop = Number(new URLSearchParams(location.split("?")[1] ?? "").get("stop"));
  const [selectedId, setSelectedId] = useState<number | null>(Number.isFinite(queryStop) && queryStop > 0 ? queryStop : null);
  
  const utils = trpc.useUtils();
  const stops = trpc.delivery.list.useQuery({ routeId });
  const geocode = trpc.delivery.geocodeRoute.useMutation({ onSuccess: () => { utils.delivery.list.invalidate(); utils.delivery.summary.invalidate(); } });
  const locatedStops = useMemo(() => (stops.data ?? []).filter((stop: any) => stop.lat != null && stop.lng != null), [stops.data]);
  const selected = (stops.data ?? []).find((stop: any) => stop.id === selectedId) ?? null;

  const nextSequence = stops.data?.find((stop: any) => stop.status === "pending")?.sequenceNumber;

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pb-8 pt-5">
      <header className="flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sky-300">
            <MapPinned size={17} />
            <p className="text-[10px] font-black uppercase tracking-[0.22em]">Embedded route map</p>
          </div>
          <h1 className="mt-2 text-2xl font-black text-white">Map & directions</h1>
          <p className="mt-1 text-xs text-slate-500">The route line follows the original sequence.</p>
        </div>
        <button onClick={() => geocode.mutate()} disabled={geocode.isPending} className="grid min-h-12 min-w-12 place-items-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300 active:scale-95 disabled:opacity-50" aria-label="Locate missing addresses"><LocateFixed size={18} /></button>
      </header>
      
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#0a1019] shadow-2xl">
        {locatedStops.length === 0 ? (
          <RouteDiagram stops={locatedStops} selectedId={selectedId} onSelect={id => { setSelectedId(id); triggerHaptic("tap"); }} />
        ) : (
          <MapWrapper>
            <Map
              defaultCenter={{ lat: 27.9147, lng: -82.8273 }}
              defaultZoom={12}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '380px' }}
              disableDefaultUI={true}
            >
              <MarkersAndLines locatedStops={locatedStops} stopsData={stops.data || []} selectedId={selectedId} setSelectedId={setSelectedId} />
            </Map>
          </MapWrapper>
        )}
      </section>

      <div className="grid grid-cols-3 gap-2">
        <Legend color="bg-amber-300" label="Next" />
        <Legend color="bg-sky-300" label="Pending" />
        <Legend color="bg-emerald-300" label="Delivered" />
      </div>
      
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
        <div className="flex items-center gap-2">
          <RouteIcon size={16} className="text-sky-300" />
          <p className="text-xs font-bold text-slate-300">{locatedStops.length} of {stops.data?.length ?? 0} pins located</p>
        </div>
        <p className="text-xs font-black text-sky-300">Next #{nextSequence ?? "—"}</p>
      </div>

      <div className="space-y-2">
        <p className="px-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-600">Select a stop</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {locatedStops.map((stop: any) => (
            <button key={stop.id} onClick={() => { setSelectedId(stop.id); triggerHaptic("tap"); }} className={`min-w-20 rounded-2xl border px-3 py-3 text-left active:scale-95 ${selectedId === stop.id ? "border-sky-300/50 bg-sky-300/15" : "border-white/10 bg-white/[0.035]"}`}>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Stop</p>
              <p className="mt-1 text-lg font-black text-white">#{stop.sequenceNumber}</p>
              <p className="mt-1 max-w-28 truncate text-[10px] text-slate-500">{stop.roadLabel}</p>
            </button>
          ))}
        </div>
      </div>
      
      <DirectionsPanel stop={selected} />
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) { return <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-2 text-[10px] font-bold text-slate-500"><span className={`h-2.5 w-2.5 rounded-full ${color}`} />{label}</div>; }

function RouteDiagram({ stops, selectedId, onSelect }: { stops: Array<{ id: number; sequenceNumber: number; lat: number | null; lng: number | null; status: string }>; selectedId: number | null; onSelect: (id: number) => void }) {
  if (!stops.length) return <div className="grid h-[380px] place-items-center bg-[#0a1019] px-8 text-center"><div><MapPinned className="mx-auto text-slate-600" size={30} /><p className="mt-3 text-sm font-bold text-slate-400">Locate addresses to draw the route</p><p className="mt-1 text-xs text-slate-600">The map will show the original sequence once GPS pins are available.</p></div></div>;
  const lats = stops.map(stop => stop.lat as number);
  const lngs = stops.map(stop => stop.lng as number);
  const minLat = Math.min(...lats); const maxLat = Math.max(...lats); const minLng = Math.min(...lngs); const maxLng = Math.max(...lngs);
  const x = (lng: number) => 7 + ((lng - minLng) / Math.max(maxLng - minLng, 0.001)) * 86;
  const y = (lat: number) => 93 - ((lat - minLat) / Math.max(maxLat - minLat, 0.001)) * 86;
  const points = stops.map(stop => `${x(stop.lng as number)},${y(stop.lat as number)}`).join(" ");
  return <div className="relative h-[380px] overflow-hidden bg-[#081322] p-3"><div className="absolute inset-0 opacity-25" style={{ backgroundImage: "linear-gradient(rgba(125,211,252,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(125,211,252,.12) 1px, transparent 1px)", backgroundSize: "38px 38px" }} /><svg viewBox="0 0 100 100" className="relative h-full w-full"><polyline points={points} fill="none" stroke="#38bdf8" strokeOpacity=".8" strokeWidth=".8" strokeDasharray="2 1.5" />{stops.map(stop => { const next = stop.status === "pending" && stop.sequenceNumber === Math.min(...stops.filter(item => item.status === "pending").map(item => item.sequenceNumber)); const active = selectedId === stop.id; return <g key={stop.id} onClick={() => onSelect(stop.id)} className="cursor-pointer"><circle cx={x(stop.lng as number)} cy={y(stop.lat as number)} r={active ? 3.1 : next ? 2.8 : 2.1} fill={next ? "#fbbf24" : stop.status === "completed" ? "#34d399" : stop.status === "skipped" ? "#94a3b8" : "#60a5fa"} stroke={active ? "#fff" : "#07101d"} strokeWidth={active ? 1 : .7} /><text x={x(stop.lng as number)} y={y(stop.lat as number) + .8} textAnchor="middle" fontSize="2.1" fontWeight="900" fill="#07101d">{stop.sequenceNumber}</text></g>; })}</svg><div className="absolute bottom-4 left-4 rounded-xl border border-white/10 bg-[#05070b]/80 px-3 py-2 text-[10px] font-bold text-slate-500 backdrop-blur"><span className="text-sky-300">Embedded route diagram</span> · tap a pin for directions</div></div>; }

