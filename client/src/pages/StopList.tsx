import { useMemo, useState } from "react";
import { Building2, Check, Clipboard, Key, MapPinned, Search, SkipForward, Sparkles, Wand2, Route as RouteIcon } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { formatCoordinates } from "@/lib/route-utils";
import { triggerHaptic } from "@/lib/mobile-utils";
import { useRouteId } from "@/_core/hooks/useRouteId";

type Filter = "all" | "pending" | "completed" | "skipped";
const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Done" },
  { key: "skipped", label: "Skipped" },
];

export default function StopList() {
  const [, navigate] = useLocation();
  const { routeId } = useRouteId();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [onlyUnlocated, setOnlyUnlocated] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const utils = trpc.useUtils();
  
  const stops = trpc.delivery.list.useQuery(filter === "all" ? { routeId } : { status: filter, routeId });
  const complete = trpc.delivery.complete.useMutation({ onSuccess: refresh });
  const skip = trpc.delivery.skip.useMutation({ onSuccess: refresh });
  const optimize = trpc.delivery.optimizeRoute.useMutation({ 
    onSuccess: () => {
      refresh();
      setIsOptimizing(false);
      triggerHaptic("success");
    }
  });

  function refresh() {
    utils.delivery.list.invalidate();
    utils.delivery.summary.invalidate();
  }

  function handleAutoOptimize() {
    triggerHaptic("tap");
    if (!confirm("This will reorder all your remaining pending stops based on your current location or nearest stop. Continue?")) return;
    
    setIsOptimizing(true);
    if (!navigator.geolocation) {
      optimize.mutate({ routeId });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        optimize.mutate({ routeId, lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        // Fallback to first pending stop's coordinates
        optimize.mutate({ routeId });
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (stops.data ?? []).filter(stop => {
      const matchesSearch = !term || `${stop.address} ${stop.municipality} ${stop.roadLabel} ${stop.complexName || ''} ${stop.lotOrUnit || ''}`.toLowerCase().includes(term);
      const matchesLocation = !onlyUnlocated || stop.lat == null || stop.lng == null;
      return matchesSearch && matchesLocation;
    });
  }, [onlyUnlocated, search, stops.data]);

  const unlocated = (stops.data ?? []).filter(stop => stop.lat == null || stop.lng == null).length;

  async function copyAddress(id: number, address: string) {
    try { await navigator.clipboard.writeText(address); triggerHaptic("tap"); setCopied(id); window.setTimeout(() => setCopied(current => current === id ? null : current), 1400); } catch { setCopied(null); }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col">
      <div className="sticky top-0 z-10 space-y-4 border-b border-white/10 bg-[#05070b]/95 px-4 pb-4 pt-5 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-300">Route Sequence</p>
            <h1 className="mt-2 text-2xl font-black text-white">Delivery stops</h1>
          </div>
          <button onClick={() => setOnlyUnlocated(value => !value)} className={`rounded-2xl border px-3 py-2 text-right text-xs font-bold ${onlyUnlocated ? "border-amber-300/30 bg-amber-300/10 text-amber-200" : "border-white/10 bg-white/[0.04] text-slate-400"}`}>
            <span className="block text-lg font-black">{unlocated}</span>
            {onlyUnlocated ? "showing GPS gaps" : "without GPS"}
          </button>
        </div>

        {/* Route Action Bar */}
        <div className="flex gap-2">
          <button 
            onClick={handleAutoOptimize} 
            disabled={isOptimizing}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-sky-400/10 border border-sky-400/20 px-4 py-3 text-sm font-black text-sky-300 active:scale-[0.98] disabled:opacity-50"
          >
            {isOptimizing ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-300 border-t-transparent" /> : <Wand2 size={16} />}
            {isOptimizing ? "Optimizing..." : "Auto-Optimize Route"}
          </button>
          <button 
            onClick={() => navigate("/map")}
            className="flex items-center justify-center gap-2 rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm font-bold text-white active:scale-[0.98]"
          >
            <RouteIcon size={16} /> Map
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={17} />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search address, park, lot, or road…" className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/50" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map(item => (
            <button key={item.key} onClick={() => setFilter(item.key)} className={`min-h-10 whitespace-nowrap rounded-xl px-4 text-xs font-black transition-colors active:scale-95 ${filter === item.key ? "bg-sky-400 text-slate-950" : "border border-white/10 bg-white/[0.04] text-slate-400"}`}>
              {item.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-600">{filtered.length} stops showing</p>
      </div>

      {stops.isLoading ? (
        <div className="grid flex-1 place-items-center py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-sky-300 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-6 py-20 text-center text-sm text-slate-500">No stops match this view.</div>
      ) : (
        <div className="divide-y divide-white/10">
          {filtered.map(stop => {
            const coordinates = formatCoordinates(stop.lat, stop.lng);
            return (
              <article key={stop.id} className="px-4 py-4 transition-colors active:bg-white/[0.03]">
                <div className="flex items-start gap-3">
                  <button onClick={() => navigate(`/stops/${stop.id}`)} className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xs font-black ${stop.status === "completed" ? "bg-emerald-400/15 text-emerald-300" : stop.status === "skipped" ? "bg-slate-400/10 text-slate-500" : "bg-sky-400/15 text-sky-300"}`}>
                    {stop.status === "completed" ? <Check size={18} /> : stop.sequenceNumber}
                  </button>
                  <button onClick={() => navigate(`/stops/${stop.id}`)} className="min-w-0 flex-1 text-left">
                    <p className={`text-sm font-bold leading-snug ${stop.status === "completed" ? "text-slate-500 line-through" : "text-white"}`}>
                      {stop.address}
                    </p>
                    <p className="mt-1 truncate text-[11px] font-semibold text-sky-300/80">
                      {stop.municipality} · {stop.roadLabel}
                    </p>

                    {/* Lot / Complex badge */}
                    {(stop.lotOrUnit || stop.complexName || stop.gateCode) && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {stop.lotOrUnit && (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-black text-amber-300">
                            <Building2 size={10} /> {stop.lotOrUnit}
                          </span>
                        )}
                        {stop.complexName && (
                          <span className="inline-flex items-center rounded bg-sky-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-sky-200 truncate max-w-[180px]">
                            {stop.complexName}
                          </span>
                        )}
                        {stop.gateCode && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-mono font-bold text-amber-200">
                            <Key size={9} /> {stop.gateCode}
                          </span>
                        )}
                      </div>
                    )}

                    {stop.specialRequest && (
                      <p className="mt-1 truncate text-xs font-semibold text-amber-200">
                        Special request: {stop.specialRequest}
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${stop.publicationType === 'New York Times' ? 'bg-indigo-400/15 text-indigo-300' : 'bg-white/5 text-slate-400'}`}>
                        {stop.publicationType || 'Tampa Bay Times'}
                      </span>
                      {stop.isExactPin ? (
                        <span className="inline-flex items-center text-[9px] font-black uppercase text-amber-300">
                          🎯 Verified Pin
                        </span>
                      ) : null}
                    </div>

                    <p className={`mt-1.5 text-[10px] font-bold uppercase tracking-wide ${coordinates ? "text-emerald-300/80" : "text-amber-300/80"}`}>
                      {coordinates ? `GPS ${coordinates}` : "GPS location needed"}
                    </p>
                  </button>
                  <div className="flex shrink-0 flex-col gap-2">
                    <button onClick={() => navigate(`/stops/${stop.id}`)} className="grid min-h-10 min-w-10 place-items-center rounded-xl bg-sky-400/10 text-sky-300 active:scale-95" aria-label={`Open directions for ${stop.address}`}>
                      <MapPinned size={16} />
                    </button>
                    {stop.status === "pending" && (
                      <button onClick={() => { triggerHaptic("success"); complete.mutate({ id: stop.id }); }} className="grid min-h-10 min-w-10 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300 active:scale-95" aria-label={`Mark ${stop.address} delivered`}>
                        <Check size={16} />
                      </button>
                    )}
                    <button onClick={() => copyAddress(stop.id, stop.address)} className="grid min-h-10 min-w-10 place-items-center rounded-xl bg-white/[0.05] text-slate-400 active:scale-95" aria-label={`Copy ${stop.address}`}>
                      {copied === stop.id ? <Sparkles size={15} /> : <Clipboard size={15} />}
                    </button>
                    {stop.status === "pending" && (
                      <button onClick={() => { triggerHaptic("warning"); skip.mutate({ id: stop.id }); }} className="grid min-h-10 min-w-10 place-items-center rounded-xl bg-white/[0.05] text-slate-500 active:scale-95" aria-label={`Skip ${stop.address}`}>
                        <SkipForward size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

