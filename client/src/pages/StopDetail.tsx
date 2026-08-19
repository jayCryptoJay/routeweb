import { useEffect, useState } from "react";
import { ArrowLeft, Check, Clipboard, Compass, FileText, Key, MapPin, MapPinned, Navigation, RotateCcw, SkipForward, Sparkles, Volume2, Building2 } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import DirectionsPanel from "@/components/DirectionsPanel";
import FineTuneGpsModal from "@/components/FineTuneGpsModal";
import { trpc } from "@/lib/trpc";
import { formatCoordinates } from "@/lib/route-utils";
import { isSpeechSupported, speakStop, stopSpeaking, triggerHaptic } from "@/lib/mobile-utils";

export default function StopDetail() {
  const [, params] = useRoute("/stops/:id");
  const [, navigate] = useLocation();
  const id = Number(params?.id);
  const utils = trpc.useUtils();
  const stop = trpc.delivery.get.useQuery({ id }, { enabled: Number.isFinite(id) && id > 0 });
  const [notes, setNotes] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [publicationType, setPublicationType] = useState("Tampa Bay Times");
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fineTuneOpen, setFineTuneOpen] = useState(false);

  useEffect(() => {
    if (stop.data) { 
      setNotes(stop.data.notes ?? ""); 
      setSpecialRequest(stop.data.specialRequest ?? ""); 
      setPublicationType(stop.data.publicationType ?? "Tampa Bay Times");
    }
  }, [stop.data]);
  useEffect(() => () => stopSpeaking(), []);

  const refresh = () => { utils.delivery.get.invalidate({ id }); utils.delivery.list.invalidate(); utils.delivery.summary.invalidate(); };
  const complete = trpc.delivery.complete.useMutation({ onSuccess: refresh });
  const skip = trpc.delivery.skip.useMutation({ onSuccess: refresh });
  const reset = trpc.delivery.reset.useMutation({ onSuccess: refresh });
  const update = trpc.delivery.updateDetails.useMutation({ onSuccess: refresh });

  if (!Number.isFinite(id) || id <= 0) return <div className="p-6 text-sm text-slate-400">Invalid stop.</div>;
  if (stop.isLoading) return <div className="grid min-h-full place-items-center"><div className="h-7 w-7 animate-spin rounded-full border-2 border-sky-300 border-t-transparent" /></div>;
  if (!stop.data) return <div className="p-6 text-sm text-slate-400">Stop not found.</div>;

  const delivery = stop.data;
  const coordinates = formatCoordinates(delivery.lat, delivery.lng);
  const isPending = delivery.status === "pending";

  function handleSpeak() {
    const speechText = `${delivery.address}${delivery.gateCode ? `. Gate code is ${delivery.gateCode}` : ""}${delivery.pinNotes ? `. Lot instructions: ${delivery.pinNotes}` : ""}`;
    const started = speakStop(speechText, delivery.specialRequest);
    triggerHaptic("tap");
    setSpeaking(started);
    if (started) window.setTimeout(() => setSpeaking(false), 7000);
  }

  async function copyAddress() {
    try { await navigator.clipboard.writeText(delivery.address); triggerHaptic("tap"); setCopied(true); window.setTimeout(() => setCopied(false), 1400); } catch { setCopied(false); }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pb-8 pt-5">
      <button onClick={() => navigate("/stops")} className="flex min-h-11 items-center gap-2 text-sm font-bold text-slate-400 active:scale-95"><ArrowLeft size={17} />Back to stops</button>
      <header className="flex items-start gap-3">
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-sm font-black ${delivery.status === "completed" ? "bg-emerald-400/15 text-emerald-300" : delivery.status === "skipped" ? "bg-slate-400/10 text-slate-400" : "bg-sky-400/15 text-sky-300"}`}>{delivery.status === "completed" ? <Check size={20} /> : delivery.sequenceNumber}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-300">Stop detail · #{delivery.sequenceNumber}</p>
            {delivery.isExactPin ? <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-black text-amber-300 uppercase">🎯 Verified Lot Pin</span> : null}
          </div>
          <h1 className="mt-2 text-xl font-black leading-snug text-white">{delivery.address}</h1>
          <p className="mt-1 text-xs font-semibold text-slate-400">{delivery.municipality} · {delivery.roadLabel}</p>
          
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="inline-flex rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-400">{delivery.status}</span>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${delivery.publicationType === 'New York Times' ? 'bg-indigo-400/15 text-indigo-300' : 'bg-white/5 text-slate-400'}`}>{delivery.publicationType || 'Tampa Bay Times'}</span>
            {delivery.lotOrUnit && <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-300"><Building2 size={11} />{delivery.lotOrUnit}</span>}
          </div>
        </div>
      </header>

      {/* Mobile Home Park / Apartment Specific Card */}
      {(delivery.complexName || delivery.gateCode || delivery.pinNotes || delivery.lotOrUnit) && (
        <section className="rounded-3xl border border-amber-300/30 bg-amber-300/[0.07] p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Sparkles size={14} />
              <span>Complex / Lot Navigation Details</span>
            </div>
            <button
              onClick={() => setFineTuneOpen(true)}
              className="text-[11px] font-bold text-sky-300 underline active:opacity-70"
            >
              Edit Details
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {delivery.complexName && (
              <div className="rounded-xl bg-black/30 p-2.5">
                <p className="text-[9px] uppercase tracking-widest text-slate-400">Complex / Park</p>
                <p className="mt-0.5 font-bold text-white truncate">{delivery.complexName}</p>
              </div>
            )}
            {delivery.gateCode && (
              <div className="rounded-xl bg-black/30 p-2.5">
                <p className="text-[9px] uppercase tracking-widest text-amber-300 flex items-center gap-1">
                  <Key size={10} /> Gate Code
                </p>
                <p className="mt-0.5 font-mono font-black text-amber-200">{delivery.gateCode}</p>
              </div>
            )}
          </div>

          {delivery.pinNotes && (
            <div className="rounded-xl bg-black/30 p-2.5 text-xs">
              <p className="text-[9px] uppercase tracking-widest text-slate-400">Lot Navigation Instructions</p>
              <p className="mt-1 text-slate-200 leading-relaxed">{delivery.pinNotes}</p>
            </div>
          )}
        </section>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => navigate(`/map?stop=${delivery.id}`)} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-sky-400 text-sm font-black text-slate-950 active:scale-[0.98]">
          <MapPinned size={17} />Map & directions
        </button>
        <button onClick={copyAddress} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-bold text-white active:scale-[0.98]">
          <Clipboard size={17} />{copied ? "Copied" : "Copy address"}
        </button>
      </div>

      <button onClick={() => setFineTuneOpen(true)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-300 text-xs font-black active:scale-[0.98]">
        <Compass size={16} /> 📍 Pinpoint Lot / Trailer Inside Complex (GPS Fine-Tune)
      </button>

      <button onClick={handleSpeak} disabled={!isSpeechSupported()} className={`flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border text-sm font-bold active:scale-[0.98] disabled:opacity-40 ${speaking ? "border-amber-300/30 bg-amber-300/10 text-amber-200" : "border-sky-400/20 bg-sky-400/10 text-sky-300"}`}>
        <Volume2 size={17} />{speaking ? "Speaking address & lot notes…" : isSpeechSupported() ? "Speak address, gate code, & notes" : "Speech unavailable in this browser"}
      </button>

      <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-300">GPS Pin Position</p>
            <p className="mt-2 text-sm font-bold text-white">{coordinates ? "GPS location available" : "GPS location needed"}</p>
            <p className={`mt-1 text-xs font-bold ${coordinates ? "text-emerald-300" : "text-amber-300"}`}>{coordinates ?? "Use the Dashboard or Map to locate this stop."}</p>
          </div>
          <Navigation className={coordinates ? "text-emerald-300" : "text-amber-300"} size={20} />
        </div>
        <div className="mt-3 flex gap-3">
          <button onClick={() => setFineTuneOpen(true)} className="text-xs font-bold text-amber-300 active:opacity-70">
            📍 Adjust Pin on Satellite View
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-black/20 p-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-600">Municipality</p>
            <p className="mt-1 text-sm font-bold text-slate-200">{delivery.municipality}</p>
          </div>
          <div className="rounded-2xl bg-black/20 p-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-600">Road</p>
            <p className="mt-1 text-sm font-bold text-slate-200">{delivery.roadLabel}</p>
          </div>
        </div>
      </section>

      <DirectionsPanel stop={delivery} />

      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.035] p-5">
        <div className="flex items-center gap-2 text-slate-300">
          <FileText size={17} />
          <p className="text-[10px] font-black uppercase tracking-[0.22em]">Delivery notes</p>
        </div>
        <label className="block">
          <span className="text-xs font-bold text-slate-500">Publication Type</span>
          <select value={publicationType} onChange={e => setPublicationType(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-sky-400/40 appearance-none">
            <option value="Tampa Bay Times">Tampa Bay Times</option>
            <option value="New York Times">New York Times</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-bold text-slate-500">Driver notes</span>
          <textarea value={notes} onChange={event => setNotes(event.target.value)} rows={3} placeholder="Add notes for this stop…" className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40" />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-amber-200/70">Special request</span>
          <textarea value={specialRequest} onChange={event => setSpecialRequest(event.target.value)} rows={2} placeholder="Leave at back door, call ahead…" className="mt-2 w-full resize-none rounded-2xl border border-amber-300/20 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-amber-300/40" />
        </label>
        <button onClick={() => update.mutate({ id, notes: notes || null, specialRequest: specialRequest || null, publicationType })} disabled={update.isPending} className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-black text-white active:scale-[0.98] disabled:opacity-50">
          {update.isPending ? "Saving…" : "Save notes"}
        </button>
      </section>

      <section className="space-y-3 pt-1">
        {isPending && (
          <>
            <button onClick={() => { triggerHaptic("success"); complete.mutate({ id }); }} disabled={complete.isPending} className="flex min-h-20 w-full items-center justify-center gap-2 rounded-3xl bg-emerald-400 text-xl font-black text-slate-950 shadow-xl shadow-emerald-950/20 active:scale-[0.98] disabled:opacity-50">
              <Check size={22} />{complete.isPending ? "Saving…" : "MARK DELIVERED"}
            </button>
            <button onClick={() => { triggerHaptic("warning"); skip.mutate({ id }); }} disabled={skip.isPending} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 text-sm font-bold text-slate-400 active:scale-[0.98] disabled:opacity-50">
              <SkipForward size={17} />{skip.isPending ? "Skipping…" : "Skip this stop"}
            </button>
          </>
        )}
        {!isPending && (
          <button onClick={() => { triggerHaptic("tap"); reset.mutate({ id }); }} disabled={reset.isPending} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 text-sm font-bold text-slate-400 active:scale-[0.98] disabled:opacity-50">
            <RotateCcw size={17} />Reset to pending
          </button>
        )}
      </section>

      {/* Fine-tune GPS Lot Pin Modal */}
      <FineTuneGpsModal
        stop={delivery}
        isOpen={fineTuneOpen}
        onClose={() => setFineTuneOpen(false)}
      />
    </div>
  );
}

