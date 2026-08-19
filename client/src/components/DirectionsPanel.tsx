import { useEffect, useState } from "react";
import { ChevronDown, LocateFixed, Navigation, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cleanInstruction } from "@/lib/route-utils";

import { LiveRouteMap } from "@/components/LiveRouteMap";

type StopDestination = {
  address: string;
  lat?: number | null;
  lng?: number | null;
};

export default function DirectionsPanel({ stop }: { stop: StopDestination | null }) {
  const [origin, setOrigin] = useState("Belleair Bluffs, FL");
  const [usingLocation, setUsingLocation] = useState(false);
  const directions = trpc.delivery.directions.useQuery(
    { origin, destination: stop?.lat != null && stop?.lng != null ? `${stop.lat},${stop.lng}` : stop?.address ?? "" },
    { enabled: Boolean(stop && origin), staleTime: 120_000 },
  );

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      position => {
        setOrigin(`${position.coords.latitude},${position.coords.longitude}`);
        setUsingLocation(true);
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 120_000 },
    );
  }, []);

  if (!stop) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 text-center">
        <Navigation className="mx-auto text-slate-600" size={24} />
        <p className="mt-3 text-sm font-semibold text-slate-400">Select a stop to see directions</p>
        <p className="mt-1 text-xs text-slate-600">Turn-by-turn steps will stay inside this app.</p>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-sky-400/20 bg-sky-400/[0.06] overflow-hidden">
      <div className="flex items-start justify-between gap-4 p-5">
        <div>
          <div className="flex items-center gap-2 text-sky-300">
            <Navigation size={17} />
            <p className="text-[10px] font-black uppercase tracking-[0.22em]">In-app directions</p>
          </div>
          <h2 className="mt-2 text-base font-bold text-white">To {stop.address}</h2>
          <p className="mt-1 text-xs text-slate-400">From {usingLocation ? "your current location" : origin}</p>
        </div>
        <button
          onClick={() => directions.refetch()}
          disabled={directions.isFetching}
          className="min-h-11 min-w-11 rounded-xl border border-white/10 bg-white/5 text-slate-300 grid place-items-center active:scale-95 disabled:opacity-50"
          aria-label="Refresh directions"
        >
          <RefreshCw size={17} className={directions.isFetching ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="border-t border-white/10 px-5 py-4">
        {directions.isLoading ? (
          <div className="flex items-center gap-3 text-sm text-slate-400"><div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-300 border-t-transparent" />Calculating route…</div>
        ) : directions.error ? (
          <div className="text-sm text-amber-300">Directions are temporarily unavailable. The stop remains selectable on the map.</div>
        ) : directions.data ? (
          <>
            <div className="mb-4">
              <LiveRouteMap destination={stop} />
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
               <a href={`http://maps.apple.com/?daddr=${stop.lat != null && stop.lng != null ? `${stop.lat},${stop.lng}` : encodeURIComponent(stop.address)}&dirflg=d`} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-[#1F2937] text-xs font-bold text-white active:scale-[0.98]"> Apple Maps (CarPlay)</a>
               <a href={`https://www.google.com/maps/dir/?api=1&destination=${stop.lat != null && stop.lng != null ? `${stop.lat},${stop.lng}` : encodeURIComponent(stop.address)}&travelmode=driving`} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-[#1F2937] text-xs font-bold text-white active:scale-[0.98]">Google Maps</a>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-black/20 p-3"><p className="text-[10px] uppercase tracking-widest text-slate-500">Drive</p><p className="mt-1 text-lg font-black text-white">{directions.data.duration.text}</p></div>
              <div className="rounded-2xl bg-black/20 p-3"><p className="text-[10px] uppercase tracking-widest text-slate-500">Distance</p><p className="mt-1 text-lg font-black text-white">{directions.data.distance.text}</p></div>
            </div>
            <div className="mt-4 space-y-2">
              {directions.data.steps.slice(0, 8).map(step => (
                <div key={step.index} className="flex gap-3 rounded-2xl bg-black/15 px-3 py-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sky-400/15 text-xs font-black text-sky-300">{step.index}</span>
                  <div className="min-w-0"><p className="text-sm font-semibold leading-snug text-slate-200">{cleanInstruction(step.instruction)}</p><p className="mt-1 text-[11px] text-slate-500">{step.distance} · {step.duration}</p></div>
                </div>
              ))}
            </div>
            {directions.data.steps.length > 8 && <p className="mt-3 flex items-center justify-center gap-1 text-xs text-slate-500"><ChevronDown size={14} />Showing first 8 steps</p>}
          </>
        ) : null}
      </div>

      <button
        onClick={() => {
          if (!navigator.geolocation) return;
          navigator.geolocation.getCurrentPosition(position => {
            setOrigin(`${position.coords.latitude},${position.coords.longitude}`);
            setUsingLocation(true);
          });
        }}
        className="flex w-full items-center justify-center gap-2 border-t border-white/10 py-3 text-xs font-bold text-sky-300 active:bg-white/5"
      >
        <LocateFixed size={15} /> Use my current location
      </button>
    </section>
  );
}
