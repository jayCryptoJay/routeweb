import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Building2, Check, ChevronRight, Compass, Key, LocateFixed, Navigation, Sparkles, Volume2, Wand2 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { formatCoordinates } from "@/lib/route-utils";
import { isSpeechSupported, requestScreenWakeLock, speakStop, stopSpeaking, triggerHaptic } from "@/lib/mobile-utils";
import { useRouteId } from "@/_core/hooks/useRouteId";
import { LiveRouteMap } from "@/components/LiveRouteMap";
import FineTuneGpsModal from "@/components/FineTuneGpsModal";

export default function DriveMode() {
  const [, navigate] = useLocation();
  const { routeId } = useRouteId();
  const utils = trpc.useUtils();
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [screenAwake, setScreenAwake] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [fineTuneOpen, setFineTuneOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [message, setMessage] = useState("");
  const stops = trpc.delivery.list.useQuery({ routeId });
  const summary = trpc.delivery.summary.useQuery({ routeId });
  const complete = trpc.delivery.complete.useMutation({ onSuccess: () => { utils.delivery.list.invalidate(); utils.delivery.summary.invalidate(); } });
  const skip = trpc.delivery.skip.useMutation({ onSuccess: () => { utils.delivery.list.invalidate(); utils.delivery.summary.invalidate(); } });
  const optimize = trpc.delivery.optimizeRoute.useMutation({ 
    onSuccess: () => {
      utils.delivery.list.invalidate();
      utils.delivery.summary.invalidate();
      setIsOptimizing(false);
      triggerHaptic("success");
      setMessage("Remaining route optimized based on location!");
    }
  });

  const pending = (stops.data ?? []).filter(stop => stop.status === "pending");
  const next = pending[0] ?? null;

  function handleAutoOptimize() {
    triggerHaptic("tap");
    if (!confirm("This will reorder all your remaining pending stops based on your current location or nearest stop. Continue?")) return;
    
    setIsOptimizing(true);
    setMessage("Optimizing route...");
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

  useEffect(() => () => { stopSpeaking(); wakeLockRef.current?.release(); }, []);
  useEffect(() => {
    const restore = () => {
      if (screenAwake && !wakeLockRef.current && document.visibilityState === "visible") requestScreenWakeLock().then(lock => { wakeLockRef.current = lock; });
    };
    document.addEventListener("visibilitychange", restore);
    return () => document.removeEventListener("visibilitychange", restore);
  }, [screenAwake]);

  async function toggleWakeLock() {
    if (wakeLockRef.current) { await wakeLockRef.current.release(); wakeLockRef.current = null; setScreenAwake(false); setMessage("Screen wake lock is off."); return; }
    const lock = await requestScreenWakeLock();
    if (!lock) { setMessage("Keep Awake is not available in this browser."); return; }
    wakeLockRef.current = lock; setScreenAwake(true); triggerHaptic("tap"); setMessage("Screen will stay awake in Drive Mode.");
  }

  function speakAddress() {
    if (!next) return;
    const speechText = `${next.address}${next.gateCode ? `. Gate code is ${next.gateCode}` : ""}${next.pinNotes ? `. Lot instructions: ${next.pinNotes}` : ""}`;
    const started = speakStop(speechText, next.specialRequest);
    triggerHaptic("tap"); setSpeaking(started); setMessage(started ? "Reading the address and lot notes aloud." : "Speech is not available in this browser.");
    if (started) window.setTimeout(() => setSpeaking(false), 7000);
  }

  if (stops.isLoading || summary.isLoading) return <div className="grid min-h-full place-items-center bg-[#05070b]"><div className="h-9 w-9 animate-spin rounded-full border-2 border-sky-300 border-t-transparent" /></div>;

  return (
    <div className="min-h-full bg-[#05070b] px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 text-white">
      <div className="mx-auto max-w-lg space-y-4">
        <div className="flex items-center justify-between gap-4">
          <button onClick={() => navigate("/")} className="flex min-h-12 items-center gap-2 rounded-2xl bg-white/[0.06] px-4 text-sm font-bold text-slate-300 active:scale-95">
            <ArrowLeft size={17} />Dashboard
          </button>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-sky-300">iPhone delivery mode</p>
            <p className="mt-1 text-xs text-slate-500">{pending.length} remaining</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={toggleWakeLock} className={`min-h-14 rounded-2xl border px-4 text-left active:scale-[0.98] ${screenAwake ? "border-emerald-300/30 bg-emerald-300/10" : "border-white/10 bg-white/[0.04]"}`}>
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Display</p>
            <p className={`mt-1 text-sm font-black ${screenAwake ? "text-emerald-300" : "text-slate-300"}`}>{screenAwake ? "Keep Awake: On" : "Keep Awake: Off"}</p>
          </button>
          <button onClick={() => navigate("/map")} className="min-h-14 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-left active:scale-[0.98]">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Progress</p>
            <p className="mt-1 text-sm font-black text-slate-300">{summary.data?.completed ?? 0} / {summary.data?.total ?? 0} delivered</p>
          </button>
        </div>
        
        <div className="flex">
          <button 
            onClick={handleAutoOptimize} 
            disabled={isOptimizing}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-sky-400/10 border border-sky-400/20 px-4 py-3 text-sm font-black text-sky-300 active:scale-[0.98] disabled:opacity-50"
          >
            {isOptimizing ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-300 border-t-transparent" /> : <Wand2 size={16} />}
            {isOptimizing ? "Optimizing..." : "Auto-Optimize Route"}
          </button>
        </div>

        {next ? (
          <>
            <section className="rounded-[2rem] border border-sky-300/25 bg-gradient-to-b from-sky-300/15 to-white/[0.03] p-5 shadow-2xl shadow-sky-950/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">Next delivery</p>
                  <p className="mt-3 text-7xl font-black leading-none text-white">#{next.sequenceNumber}</p>
                </div>
                <div className="pt-1 text-right">
                  <p className="text-sm font-bold text-sky-200">{next.municipality}</p>
                  <p className="mt-1 text-xs text-slate-500">Sequence locked</p>
                  {next.isExactPin ? (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-amber-400/20 px-2 py-0.5 text-[9px] font-black text-amber-300 uppercase">
                      🎯 Exact Pin
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-7 rounded-2xl bg-black/25 px-4 py-5">
                <p className="text-2xl font-black leading-snug text-white">{next.address}</p>
                {formatCoordinates(next.lat, next.lng) && (
                  <p className="mt-2 text-xs text-emerald-300">GPS {formatCoordinates(next.lat, next.lng)}</p>
                )}

                {/* Sub-location / Park / Gate Badges */}
                {(next.lotOrUnit || next.complexName || next.gateCode || next.pinNotes) && (
                  <div className="mt-3.5 space-y-2 border-t border-white/10 pt-3">
                    <div className="flex flex-wrap gap-2">
                      {next.lotOrUnit && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-400/20 px-2.5 py-1 text-xs font-black text-amber-300">
                          <Building2 size={13} /> {next.lotOrUnit}
                        </span>
                      )}
                      {next.complexName && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-sky-400/20 px-2.5 py-1 text-xs font-bold text-sky-200">
                          {next.complexName}
                        </span>
                      )}
                      {next.gateCode && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-black font-mono text-amber-200">
                          <Key size={12} /> Gate: {next.gateCode}
                        </span>
                      )}
                    </div>
                    {next.pinNotes && (
                      <p className="text-xs font-semibold text-amber-100 bg-black/30 rounded-xl p-2.5 border border-amber-300/20">
                        📍 {next.pinNotes}
                      </p>
                    )}
                  </div>
                )}

                {next.specialRequest && (
                  <p className="mt-3 text-base font-bold leading-snug text-amber-200">
                    Special request: {next.specialRequest}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${next.publicationType === 'New York Times' ? 'bg-indigo-400/15 text-indigo-300' : 'bg-white/5 text-slate-400'}`}>
                    {next.publicationType || 'Tampa Bay Times'}
                  </span>
                  <button
                    onClick={() => setFineTuneOpen(true)}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:underline"
                  >
                    <Compass size={13} /> Fine-tune Lot GPS
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <LiveRouteMap destination={next} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button onClick={() => navigate(`/stops/${next.id}`)} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-sky-400 text-base font-black text-slate-950 active:scale-[0.98]">
                  <Navigation size={17} />Directions
                </button>
                <button onClick={speakAddress} className={`flex min-h-14 items-center justify-center gap-2 rounded-2xl border text-base font-black active:scale-[0.98] ${speaking ? "border-amber-300/40 bg-amber-300/15 text-amber-200" : "border-white/15 bg-white/10 text-white"}`}>
                  <Volume2 size={17} />{speaking ? "Speaking…" : "Speak"}
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <a href={`http://maps.apple.com/?daddr=${next.lat != null && next.lng != null ? `${next.lat},${next.lng}` : encodeURIComponent(next.address)}&dirflg=d`} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center justify-center rounded-2xl border border-white/10 bg-[#1F2937] text-sm font-bold text-white active:scale-[0.98]">
                   Apple Maps
                </a>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${next.lat != null && next.lng != null ? `${next.lat},${next.lng}` : encodeURIComponent(next.address)}&travelmode=driving`} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center justify-center rounded-2xl border border-white/10 bg-[#1F2937] text-sm font-bold text-white active:scale-[0.98]">
                  Google Maps
                </a>
              </div>
            </section>

            <button onClick={() => { triggerHaptic("success"); complete.mutate({ id: next.id }); setMessage(`Stop #${next.sequenceNumber} delivered. Loading next stop…`); }} disabled={complete.isPending} className="flex min-h-24 w-full items-center justify-center gap-3 rounded-[1.75rem] bg-emerald-400 text-2xl font-black text-slate-950 shadow-xl shadow-emerald-950/30 active:scale-[0.98] disabled:opacity-50">
              <Check size={26} />{complete.isPending ? "Saving…" : "MARK DELIVERED"}
            </button>

            <button onClick={() => { if (!confirm(`Skip stop #${next.sequenceNumber}?`)) return; triggerHaptic("warning"); skip.mutate({ id: next.id }); }} disabled={skip.isPending} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 text-base font-bold text-slate-500 active:scale-[0.98] disabled:opacity-50">
              {skip.isPending ? "Skipping…" : "Skip this stop"}<ChevronRight size={17} />
            </button>
          </>
        ) : (
          <section className="rounded-[2rem] border border-emerald-300/25 bg-emerald-300/10 px-5 py-12 text-center">
            <Check className="mx-auto text-emerald-300" size={48} />
            <h1 className="mt-5 text-3xl font-black text-emerald-200">Route complete</h1>
            <p className="mt-2 text-sm text-slate-400">All {summary.data?.total ?? 0} stops are finished.</p>
            <button onClick={() => navigate("/")} className="mt-8 min-h-14 rounded-2xl bg-white/10 px-8 text-sm font-black text-white">Return to dashboard</button>
          </section>
        )}

        <p className="min-h-5 text-center text-xs text-slate-500" aria-live="polite">
          {message || (isSpeechSupported() ? "Voice and large controls are ready." : "Large touch controls are ready.")}
        </p>
        <p className="flex items-center justify-center gap-2 text-center text-[10px] leading-relaxed text-slate-700">
          <LocateFixed size={13} />Use these controls only when safely parked or mounted without interacting while driving.
        </p>
      </div>

      {next && (
        <FineTuneGpsModal
          stop={next}
          isOpen={fineTuneOpen}
          onClose={() => setFineTuneOpen(false)}
        />
      )}
    </div>
  );
}

