import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Check, LocateFixed, MapPinned, Navigation, Route, Search, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatCoordinates } from "@/lib/route-utils";
import { useRouteId } from "@/_core/hooks/useRouteId";

export default function Home() {
  const [, navigate] = useLocation();
  const [message, setMessage] = useState("");
  const { routeId, setRouteId } = useRouteId();
  const utils = trpc.useUtils();
  const summary = trpc.delivery.summary.useQuery({ routeId });
  const stops = trpc.delivery.list.useQuery({ routeId });
  const geocode = trpc.delivery.geocodeRoute.useMutation({
    onSuccess: result => {
      setMessage(`${result.geocoded} addresses located${result.notFound ? ` · ${result.notFound} need review` : ""}`);
      utils.delivery.summary.invalidate();
      utils.delivery.list.invalidate();
    },
    onError: () => setMessage("Location service unavailable. Try again when connected."),
  });

  const nextStop = summary.data?.nextPending ?? null;
  const total = summary.data?.total ?? 0;
  const progress = summary.data?.completionPercentage ?? 0;
  const circumference = 2 * Math.PI * 49;
  const dashOffset = circumference - (progress / 100) * circumference;
  const located = summary.data?.located ?? 0;
  const coverage = total ? Math.round((located / total) * 100) : 0;
  const nextCoordinates = formatCoordinates(nextStop?.lat, nextStop?.lng);
  const areaCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const stop of stops.data ?? []) counts.set(stop.municipality, (counts.get(stop.municipality) ?? 0) + 1);
    return Array.from(counts.entries());
  }, [stops.data]);

  if (summary.isLoading) return <Loading />;

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 pb-8 pt-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-300"><Route size={16} /><p className="text-[10px] font-black uppercase tracking-[0.24em]">Route Optimizer Elite</p></div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-white">Good morning, driver.</h1>
          <div className="mt-2 flex items-center gap-2">
            <label className="text-xs text-slate-400">Route ID:</label>
            <input 
              type="text" 
              value={routeId} 
              onChange={e => setRouteId(e.target.value)} 
              className="bg-transparent border-b border-slate-700 text-sm text-white focus:outline-none focus:border-sky-400 w-32" 
            />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-right"><p className="text-[10px] uppercase tracking-widest text-slate-500">Stops</p><p className="mt-1 text-lg font-black text-white">{total}</p></div>
      </header>

      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#101a2a] via-[#0b111b] to-[#0a0e16] p-5 shadow-2xl shadow-black/20">
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            <svg width="128" height="128" viewBox="0 0 128 128" role="img" aria-label={`${progress}% route complete`}>
              <circle cx="64" cy="64" r="49" fill="none" stroke="#1e293b" strokeWidth="11" />
              <circle cx="64" cy="64" r="49" fill="none" stroke="#38bdf8" strokeWidth="11" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset} transform="rotate(-90 64 64)" className="transition-all duration-700" />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center"><p className="text-2xl font-black text-white">{progress}%</p><p className="-mt-5 text-[9px] font-bold uppercase tracking-widest text-slate-500">complete</p></div>
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <Metric label="Completed" value={summary.data?.completed ?? 0} color="text-emerald-300" />
            <Metric label="Pending" value={summary.data?.pending ?? 0} color="text-amber-300" />
            <Metric label="Skipped" value={summary.data?.skipped ?? 0} color="text-slate-300" />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">{areaCounts.map(([area, count]) => <span key={area} className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-400">{area} · {count}</span>)}</div>
      </section>

      <button onClick={() => navigate("/drive-mode")} className="group flex w-full items-center justify-between rounded-3xl border border-sky-400/25 bg-gradient-to-r from-sky-500/20 to-blue-500/5 px-5 py-5 text-left active:scale-[0.99] transition-transform">
        <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-300 text-slate-950"><Zap size={23} fill="currentColor" /></div><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-300">Built for iPhone</p><p className="mt-1 text-lg font-black text-white">Enter Drive Mode</p><p className="mt-1 text-xs text-slate-400">Large controls · voice · keep screen awake</p></div></div><ArrowRight className="text-sky-300 transition-transform group-hover:translate-x-1" />
      </button>

      {nextStop ? (
        <section className="overflow-hidden rounded-3xl border border-amber-300/20 bg-amber-300/[0.055]">
          <div className="flex items-start justify-between gap-4 p-5">
            <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">Next stop · sequence locked</p><p className="mt-3 text-6xl font-black leading-none text-white">#{nextStop.sequenceNumber}</p></div>
            <div className="text-right"><p className="text-xs font-bold text-amber-100">{nextStop.municipality}</p><p className="mt-1 text-[11px] text-slate-500">{nextStop.roadLabel}</p></div>
          </div>
          <div className="border-t border-white/10 px-5 py-4"><p className="text-xl font-black leading-snug text-white">{nextStop.address}</p>{nextCoordinates && <p className="mt-2 text-xs text-emerald-300">GPS {nextCoordinates}</p>}{nextStop.specialRequest && <p className="mt-3 text-sm font-semibold text-amber-200">Special request: {nextStop.specialRequest}</p>}</div>
          <div className="grid grid-cols-2 border-t border-white/10"><button onClick={() => navigate(`/stops/${nextStop.id}`)} className="flex min-h-14 items-center justify-center gap-2 border-r border-white/10 text-sm font-bold text-sky-300 active:bg-white/5"><Search size={16} />Details</button><button onClick={() => navigate("/map")} className="flex min-h-14 items-center justify-center gap-2 text-sm font-bold text-slate-200 active:bg-white/5"><MapPinned size={16} />Open map</button></div>
        </section>
      ) : <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-8 text-center"><Check className="mx-auto text-emerald-300" size={32} /><p className="mt-3 text-xl font-black text-emerald-200">Route complete</p><p className="mt-1 text-sm text-slate-400">All {total} stops are finished.</p></div>}

      <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
        <div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><LocateFixed className="mt-0.5 text-sky-300" size={18} /><div><p className="text-xs font-bold text-slate-200">Address location coverage</p><p className="mt-1 text-lg font-black text-white">{located} / {total} located</p><p className="mt-1 text-xs text-slate-500">GPS pins keep map markers and directions precise.</p></div></div><p className="text-sm font-black text-sky-300">{coverage}%</p></div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-sky-400 transition-all duration-500" style={{ width: `${coverage}%` }} /></div>
        <button onClick={() => geocode.mutate()} disabled={geocode.isPending} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sm font-bold text-sky-300 active:scale-[0.99] disabled:opacity-50"><LocateFixed size={16} />{geocode.isPending ? "Locating missing addresses…" : located === total ? "Refresh locations" : "Locate missing addresses"}</button>
        {message && <p className="mt-2 text-center text-xs text-slate-500">{message}</p>}
      </section>

      <div className="grid grid-cols-2 gap-3"><button onClick={() => navigate("/stops")} className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 text-left active:scale-[0.99]"><p className="text-[10px] uppercase tracking-widest text-slate-500">Stops</p><p className="mt-2 text-2xl font-black text-white">{total}</p><p className="mt-1 text-xs font-semibold text-sky-300">Review sequence →</p></button><button onClick={() => navigate("/map")} className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 text-left active:scale-[0.99]"><p className="text-[10px] uppercase tracking-widest text-slate-500">Map</p><p className="mt-2 text-2xl font-black text-white">{located}</p><p className="mt-1 text-xs font-semibold text-sky-300">View route →</p></button></div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) { return <div className="flex items-center justify-between"><span className="text-xs text-slate-500">{label}</span><span className={`text-sm font-black ${color}`}>{value}</span></div>; }
function Loading() { return <div className="grid min-h-full place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-300 border-t-transparent" /></div>; }
