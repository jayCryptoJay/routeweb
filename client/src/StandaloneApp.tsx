import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Home,
  LocateFixed,
  Navigation,
  RotateCcw,
  Search,
  Volume2,
} from "lucide-react";
import {
  type LocalDeliveryStop,
  loadLocalDeliveryStops,
  resetLocalDeliveryStops,
  routeSummary,
  saveLocalDeliveryStops,
} from "@/lib/local-delivery-store";
import { isSpeechSupported, requestScreenWakeLock, speakStop, stopSpeaking, triggerHaptic } from "@/lib/mobile-utils";

type View = "home" | "drive" | "stops" | "help";

function destinationUrl(stop: LocalDeliveryStop, provider: "apple" | "google") {
  const destination = encodeURIComponent(stop.lat != null && stop.lng != null ? `${stop.lat},${stop.lng}` : stop.address);
  return provider === "apple"
    ? `https://maps.apple.com/?daddr=${destination}&dirflg=d`
    : `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
}

export default function StandaloneApp() {
  const [stops, setStops] = useState<LocalDeliveryStop[]>(() => loadLocalDeliveryStops());
  const [view, setView] = useState<View>("home");
  const [query, setQuery] = useState("");
  const [screenAwake, setScreenAwake] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const summary = useMemo(() => routeSummary(stops), [stops]);
  const next = summary.nextPending;

  useEffect(() => {
    saveLocalDeliveryStops(stops);
  }, [stops]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    return () => stopSpeaking();
  }, []);

  useEffect(() => {
    let active = true;
    async function keepScreenAwake() {
      if (view !== "drive") return;
      const lock = await requestScreenWakeLock();
      if (!active) {
        void lock?.release();
        return;
      }
      if (lock) {
        wakeLockRef.current = lock;
        setScreenAwake(true);
      }
    }
    void keepScreenAwake();

    return () => {
      active = false;
      if (view === "drive") {
        void wakeLockRef.current?.release();
        wakeLockRef.current = null;
        setScreenAwake(false);
      }
    };
  }, [view]);

  function updateStop(id: number, update: (stop: LocalDeliveryStop) => LocalDeliveryStop) {
    setStops(current => current.map(stop => stop.id === id ? update(stop) : stop));
  }

  function completeStop(stop: LocalDeliveryStop) {
    updateStop(stop.id, current => ({ ...current, status: "completed", completedAt: Date.now() }));
    triggerHaptic("success");
  }

  function skipStop(stop: LocalDeliveryStop) {
    updateStop(stop.id, current => ({ ...current, status: "skipped", completedAt: null }));
    triggerHaptic("warning");
  }

  function restoreStop(stop: LocalDeliveryStop) {
    updateStop(stop.id, current => ({ ...current, status: "pending", completedAt: null }));
    triggerHaptic("tap");
  }

  function resetRoute() {
    if (!confirm("Reset all stops to pending on this iPhone? This clears today’s saved delivery progress.")) return;
    setStops(resetLocalDeliveryStops());
    setView("home");
    triggerHaptic("warning");
  }

  function speakCurrentStop() {
    if (!next) return;
    const text = `${next.address}${next.lotOrUnit ? `. ${next.lotOrUnit}` : ""}${next.complexName ? `. ${next.complexName}` : ""}`;
    if (speakStop(text, next.specialRequest)) triggerHaptic("tap");
  }

  const navigation = (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#060a11]/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
        <NavButton active={view === "home"} icon={<Home size={19} />} label="Route" onClick={() => setView("home")} />
        <NavButton active={view === "drive"} icon={<Navigation size={19} />} label="Drive" onClick={() => setView("drive")} />
        <NavButton active={view === "stops"} icon={<ClipboardList size={19} />} label="Stops" onClick={() => setView("stops")} />
        <NavButton active={view === "help"} icon={<CircleHelp size={19} />} label="Setup" onClick={() => setView("help")} />
      </div>
    </nav>
  );

  return (
    <div className="min-h-dvh bg-[#05070b] pb-[calc(5.75rem+env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)] text-white">
      {view === "home" && <RouteHome summary={summary} next={next} onDrive={() => setView("drive")} onStops={() => setView("stops")} onReset={resetRoute} />}
      {view === "drive" && <DriveScreen next={next} summary={summary} screenAwake={screenAwake} onBack={() => setView("home")} onComplete={completeStop} onSkip={skipStop} onSpeak={speakCurrentStop} />}
      {view === "stops" && <StopsScreen stops={stops} query={query} onQuery={setQuery} onBack={() => setView("home")} onComplete={completeStop} onSkip={skipStop} onRestore={restoreStop} />}
      {view === "help" && <SetupScreen onReset={resetRoute} />}
      {navigation}
    </div>
  );
}

function RouteHome({ summary, next, onDrive, onStops, onReset }: {
  summary: ReturnType<typeof routeSummary>;
  next: LocalDeliveryStop | null;
  onDrive: () => void;
  onStops: () => void;
  onReset: () => void;
}) {
  const circumference = 2 * Math.PI * 49;
  const dashOffset = circumference - (summary.completionPercentage / 100) * circumference;

  return (
    <main className="mx-auto max-w-lg space-y-5 px-4 pb-6 pt-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-300">RouteWeb · iPhone delivery</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-white">Your newspaper route</h1>
          <p className="mt-1 text-xs text-slate-400">Fixed sequence · progress saved on this iPhone</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-right"><p className="text-[10px] uppercase tracking-widest text-slate-500">Stops</p><p className="mt-1 text-lg font-black text-white">{summary.total}</p></div>
      </header>

      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#101a2a] via-[#0b111b] to-[#0a0e16] p-5 shadow-2xl shadow-black/20">
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            <svg width="128" height="128" viewBox="0 0 128 128" role="img" aria-label={`${summary.completionPercentage}% route complete`}>
              <circle cx="64" cy="64" r="49" fill="none" stroke="#1e293b" strokeWidth="11" />
              <circle cx="64" cy="64" r="49" fill="none" stroke="#38bdf8" strokeWidth="11" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset} transform="rotate(-90 64 64)" className="transition-all duration-500" />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center"><p className="text-2xl font-black text-white">{summary.completionPercentage}%</p><p className="-mt-5 text-[9px] font-bold uppercase tracking-widest text-slate-500">complete</p></div>
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <Metric label="Delivered" value={summary.completed} color="text-emerald-300" />
            <Metric label="Remaining" value={summary.pending} color="text-amber-300" />
            <Metric label="Skipped" value={summary.skipped} color="text-slate-300" />
          </div>
        </div>
      </section>

      <button onClick={onDrive} className="group flex w-full items-center justify-between rounded-3xl border border-sky-400/25 bg-gradient-to-r from-sky-500/20 to-blue-500/5 px-5 py-5 text-left active:scale-[0.99]">
        <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-300 text-slate-950"><Navigation size={23} fill="currentColor" /></div><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-300">Ready when you are</p><p className="mt-1 text-lg font-black text-white">Enter Drive Mode</p><p className="mt-1 text-xs text-slate-400">Apple Maps · voice · large controls</p></div></div><ChevronRight className="text-sky-300 transition-transform group-hover:translate-x-1" />
      </button>

      {next ? (
        <section className="overflow-hidden rounded-3xl border border-amber-300/20 bg-amber-300/[0.055]">
          <div className="flex items-start justify-between gap-4 p-5"><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">Next stop · published order</p><p className="mt-3 text-6xl font-black leading-none text-white">#{next.sequenceNumber}</p></div><div className="text-right"><p className="text-xs font-bold text-amber-100">{next.municipality}</p><p className="mt-1 text-[11px] text-slate-500">{next.roadLabel}</p></div></div>
          <div className="border-t border-white/10 px-5 py-4"><p className="text-xl font-black leading-snug text-white">{next.address}</p>{next.lotOrUnit && <p className="mt-2 text-sm font-bold text-amber-200">{next.lotOrUnit}</p>}{next.complexName && <p className="mt-1 text-xs text-sky-200">{next.complexName}</p>}</div>
          <div className="grid grid-cols-2 border-t border-white/10"><a href={destinationUrl(next, "apple")} className="flex min-h-14 items-center justify-center gap-2 border-r border-white/10 text-sm font-bold text-sky-300 active:bg-white/5"><Navigation size={16} />Apple Maps</a><button onClick={onStops} className="flex min-h-14 items-center justify-center gap-2 text-sm font-bold text-slate-200 active:bg-white/5"><ClipboardList size={16} />Review stops</button></div>
        </section>
      ) : <section className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-8 text-center"><Check className="mx-auto text-emerald-300" size={32} /><p className="mt-3 text-xl font-black text-emerald-200">Route complete</p><p className="mt-1 text-sm text-slate-400">All {summary.total} stops are finished.</p></section>}

      <button onClick={onReset} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] text-sm font-bold text-slate-400 active:scale-[0.99]"><RotateCcw size={16} />Reset this phone’s route progress</button>
    </main>
  );
}

function DriveScreen({ next, summary, screenAwake, onBack, onComplete, onSkip, onSpeak }: {
  next: LocalDeliveryStop | null;
  summary: ReturnType<typeof routeSummary>;
  screenAwake: boolean;
  onBack: () => void;
  onComplete: (stop: LocalDeliveryStop) => void;
  onSkip: (stop: LocalDeliveryStop) => void;
  onSpeak: () => void;
}) {
  if (!next) {
    return <main className="mx-auto max-w-lg px-4 pb-6 pt-5"><button onClick={onBack} className="flex min-h-11 items-center gap-2 text-sm font-bold text-slate-400"><ArrowLeft size={17} />Back to route</button><section className="mt-6 rounded-[2rem] border border-emerald-300/25 bg-emerald-300/10 px-5 py-12 text-center"><Check className="mx-auto text-emerald-300" size={48} /><h1 className="mt-5 text-3xl font-black text-emerald-200">Route complete</h1><p className="mt-2 text-sm text-slate-400">All {summary.total} stops are finished.</p></section></main>;
  }

  return (
    <main className="mx-auto max-w-lg space-y-4 px-4 pb-6 pt-5">
      <div className="flex items-center justify-between gap-3"><button onClick={onBack} className="flex min-h-11 items-center gap-2 rounded-2xl bg-white/[0.06] px-4 text-sm font-bold text-slate-300 active:scale-95"><ArrowLeft size={17} />Route</button><div className="text-right"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-300">Drive mode</p><p className="mt-1 text-xs text-slate-500">{summary.pending} remaining · {screenAwake ? "display awake" : "screen control ready"}</p></div></div>
      <section className="rounded-[2rem] border border-sky-300/25 bg-gradient-to-b from-sky-300/15 to-white/[0.03] p-5 shadow-2xl shadow-sky-950/20">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">Next delivery</p><p className="mt-3 text-7xl font-black leading-none text-white">#{next.sequenceNumber}</p></div><div className="pt-1 text-right"><p className="text-sm font-bold text-sky-200">{next.municipality}</p><p className="mt-1 text-xs text-slate-500">Fixed sequence</p></div></div>
        <div className="mt-7 rounded-2xl bg-black/25 px-4 py-5"><p className="text-2xl font-black leading-snug text-white">{next.address}</p>{next.lotOrUnit && <p className="mt-3 text-sm font-black text-amber-200">{next.lotOrUnit}</p>}{next.complexName && <p className="mt-1 text-sm font-semibold text-sky-200">{next.complexName}</p>}{next.notes && <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm leading-snug text-slate-200">{next.notes}</p>}</div>
        <div className="mt-4 grid grid-cols-2 gap-3"><a href={destinationUrl(next, "apple")} className="flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-sky-400 px-3 text-base font-black text-slate-950 active:scale-[0.98]"><Navigation size={18} />Apple Maps</a><a href={destinationUrl(next, "google")} className="flex min-h-16 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 text-base font-black text-white active:scale-[0.98]"><Navigation size={18} />Google Maps</a></div>
        <button onClick={onSpeak} disabled={!isSpeechSupported()} className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] text-base font-black text-white active:scale-[0.98] disabled:opacity-40"><Volume2 size={17} />{isSpeechSupported() ? "Speak stop" : "Speech unavailable"}</button>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-500">Use your navigation app for directions. Review notes and mark delivery only while parked or safely stopped.</p>
      </section>
      <button onClick={() => onComplete(next)} className="flex min-h-24 w-full items-center justify-center gap-3 rounded-[1.75rem] bg-emerald-400 text-2xl font-black text-slate-950 shadow-xl shadow-emerald-950/30 active:scale-[0.98]"><Check size={26} />MARK DELIVERED</button>
      <button onClick={() => { if (confirm(`Skip stop #${next.sequenceNumber}? You can restore it from the Stops tab.`)) onSkip(next); }} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 text-base font-bold text-slate-500 active:scale-[0.98]">Skip this stop<ChevronRight size={17} /></button>
    </main>
  );
}

function StopsScreen({ stops, query, onQuery, onBack, onComplete, onSkip, onRestore }: {
  stops: LocalDeliveryStop[];
  query: string;
  onQuery: (value: string) => void;
  onBack: () => void;
  onComplete: (stop: LocalDeliveryStop) => void;
  onSkip: (stop: LocalDeliveryStop) => void;
  onRestore: (stop: LocalDeliveryStop) => void;
}) {
  const normalizedQuery = query.trim().toLowerCase();
  const filteredStops = stops.filter(stop => !normalizedQuery || `${stop.sequenceNumber} ${stop.address} ${stop.municipality}`.toLowerCase().includes(normalizedQuery));

  return (
    <main className="mx-auto max-w-lg space-y-4 px-4 pb-6 pt-5">
      <header className="flex items-center justify-between gap-3"><button onClick={onBack} className="flex min-h-11 items-center gap-2 text-sm font-bold text-slate-400"><ArrowLeft size={17} />Route</button><p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-300">All stops</p></header>
      <label className="flex min-h-13 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4"><Search size={18} className="text-slate-500" /><input value={query} onChange={event => onQuery(event.target.value)} placeholder="Find a stop or address" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600" /></label>
      <div className="space-y-2">{filteredStops.map(stop => <StopCard key={stop.id} stop={stop} onComplete={onComplete} onSkip={onSkip} onRestore={onRestore} />)}</div>
    </main>
  );
}

function StopCard({ stop, onComplete, onSkip, onRestore }: {
  stop: LocalDeliveryStop;
  onComplete: (stop: LocalDeliveryStop) => void;
  onSkip: (stop: LocalDeliveryStop) => void;
  onRestore: (stop: LocalDeliveryStop) => void;
}) {
  const statusClass = stop.status === "completed" ? "bg-emerald-400/15 text-emerald-300" : stop.status === "skipped" ? "bg-slate-400/10 text-slate-400" : "bg-sky-400/15 text-sky-300";
  return <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><div className="flex items-start gap-3"><div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-black ${statusClass}`}>{stop.status === "completed" ? <Check size={18} /> : stop.sequenceNumber}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="text-sm font-black leading-snug text-white">{stop.address}</p><span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-black uppercase ${statusClass}`}>{stop.status}</span></div><p className="mt-1 text-xs text-slate-500">{stop.municipality} · {stop.roadLabel}</p>{stop.lotOrUnit && <p className="mt-1 text-xs font-bold text-amber-200">{stop.lotOrUnit}</p>}</div></div><div className="mt-3 grid grid-cols-3 gap-2">{stop.status === "pending" ? <><a href={destinationUrl(stop, "apple")} className="flex min-h-11 items-center justify-center rounded-xl bg-sky-400/10 text-xs font-black text-sky-300 active:scale-[0.98]">Maps</a><button onClick={() => onComplete(stop)} className="flex min-h-11 items-center justify-center rounded-xl bg-emerald-400/15 text-xs font-black text-emerald-300 active:scale-[0.98]">Delivered</button><button onClick={() => onSkip(stop)} className="flex min-h-11 items-center justify-center rounded-xl bg-white/[0.04] text-xs font-black text-slate-400 active:scale-[0.98]">Skip</button></> : <><a href={destinationUrl(stop, "apple")} className="flex min-h-11 items-center justify-center rounded-xl bg-sky-400/10 text-xs font-black text-sky-300 active:scale-[0.98]">Maps</a><button onClick={() => onRestore(stop)} className="col-span-2 flex min-h-11 items-center justify-center gap-1 rounded-xl bg-white/[0.04] text-xs font-black text-slate-300 active:scale-[0.98]"><RotateCcw size={13} />Restore to pending</button></>}</div></article>;
}

function SetupScreen({ onReset }: { onReset: () => void }) {
  return <main className="mx-auto max-w-lg space-y-5 px-4 pb-6 pt-5"><header><p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-300">Use on iPhone</p><h1 className="mt-2 text-2xl font-black text-white">Set up once, deliver faster</h1></header><section className="space-y-4 rounded-3xl border border-sky-400/20 bg-sky-400/[0.06] p-5"><SetupStep number="1" title="Open in Safari" description="Use Safari on your iPhone for the most reliable navigation handoff, voice, and home-screen support." /><SetupStep number="2" title="Add to Home Screen" description="Tap Share, then Add to Home Screen. Launch the RouteWeb icon before each route." /><SetupStep number="3" title="Use Drive Mode" description="Tap Apple Maps for turn-by-turn directions, then return and mark each paper delivered while safely stopped." /></section><section className="rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-5"><div className="flex items-start gap-3"><LocateFixed className="mt-0.5 text-amber-300" size={18} /><div><p className="text-sm font-black text-amber-100">Progress stays on this iPhone</p><p className="mt-1 text-sm leading-relaxed text-slate-400">Your delivery status is saved directly in this browser, so it works without an account and survives closing the app. Clearing Safari website data or resetting the route clears that saved progress.</p></div></div></section><button onClick={onReset} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] text-sm font-bold text-slate-400 active:scale-[0.99]"><RotateCcw size={16} />Reset this phone’s route progress</button></main>;
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button onClick={onClick} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold active:scale-95 ${active ? "bg-sky-400/15 text-sky-300" : "text-slate-500"}`}>{icon}<span>{label}</span></button>;
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="flex items-center justify-between"><span className="text-xs text-slate-500">{label}</span><span className={`text-sm font-black ${color}`}>{value}</span></div>;
}

function SetupStep({ number, title, description }: { number: string; title: string; description: string }) {
  return <div className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sky-400 text-xs font-black text-slate-950">{number}</span><div><p className="text-sm font-black text-white">{title}</p><p className="mt-1 text-sm leading-relaxed text-slate-400">{description}</p></div></div>;
}
