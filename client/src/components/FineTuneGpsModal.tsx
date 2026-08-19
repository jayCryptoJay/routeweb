/// <reference types="@types/google.maps" />
import { useState, useEffect } from "react";
import { X, LocateFixed, Check, MapPin, Sparkles, Key, Building2, Compass, AlertCircle } from "lucide-react";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { MapWrapper } from "@/components/MapConfig";
import { trpc } from "@/lib/trpc";
import { triggerHaptic } from "@/lib/mobile-utils";

interface FineTuneGpsModalProps {
  stop: {
    id: number;
    sequenceNumber: number;
    address: string;
    roadLabel: string;
    municipality: string;
    lat?: number | null;
    lng?: number | null;
    lotOrUnit?: string | null;
    complexName?: string | null;
    gateCode?: string | null;
    pinNotes?: string | null;
    isExactPin?: number | null;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function FineTuneGpsModal({ stop, isOpen, onClose }: FineTuneGpsModalProps) {
  const utils = trpc.useUtils();
  const updateDetails = trpc.delivery.updateDetails.useMutation({
    onSuccess: () => {
      utils.delivery.get.invalidate({ id: stop.id });
      utils.delivery.list.invalidate();
      utils.delivery.summary.invalidate();
      triggerHaptic("success");
      onClose();
    },
  });

  const [lat, setLat] = useState<number>(stop.lat ?? 27.9150);
  const [lng, setLng] = useState<number>(stop.lng ?? -82.8180);
  const [lotOrUnit, setLotOrUnit] = useState<string>(stop.lotOrUnit ?? "");
  const [complexName, setComplexName] = useState<string>(stop.complexName ?? "");
  const [gateCode, setGateCode] = useState<string>(stop.gateCode ?? "");
  const [pinNotes, setPinNotes] = useState<string>(stop.pinNotes ?? "");
  const [isExactPin, setIsExactPin] = useState<boolean>(Boolean(stop.isExactPin));
  const [locatingCurrent, setLocatingCurrent] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLat(stop.lat ?? 27.9150);
      setLng(stop.lng ?? -82.8180);
      setLotOrUnit(stop.lotOrUnit ?? "");
      setComplexName(stop.complexName ?? "");
      setGateCode(stop.gateCode ?? "");
      setPinNotes(stop.pinNotes ?? "");
      setIsExactPin(Boolean(stop.isExactPin));
      setSaveSuccess(false);
    }
  }, [isOpen, stop]);

  if (!isOpen) return null;

  function useDeviceLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported in this browser.");
      return;
    }
    setLocatingCurrent(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = Number(position.coords.latitude.toFixed(6));
        const newLng = Number(position.coords.longitude.toFixed(6));
        setLat(newLat);
        setLng(newLng);
        setIsExactPin(true);
        setLocatingCurrent(false);
        triggerHaptic("tap");
      },
      (err) => {
        alert("Could not retrieve GPS position: " + (err.message || "Permission denied"));
        setLocatingCurrent(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  function handleSave() {
    updateDetails.mutate({
      id: stop.id,
      lat,
      lng,
      lotOrUnit: lotOrUnit || null,
      complexName: complexName || null,
      gateCode: gateCode || null,
      pinNotes: pinNotes || null,
      isExactPin: isExactPin ? 1 : 0,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-t-[2rem] sm:rounded-3xl border border-sky-400/25 bg-[#0a1019] text-white shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-sky-950/20">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400/20 text-amber-300">
              <Compass size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">Precise Lot & Complex GPS</p>
              <h2 className="text-base font-black text-white">Stop #{stop.sequenceNumber} · Pinpoint Location</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20 active:scale-95"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="rounded-2xl bg-black/30 border border-white/10 p-3.5">
            <p className="text-xs font-black text-slate-200">{stop.address}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">{stop.municipality} · {stop.roadLabel}</p>
          </div>

          {/* Interactive Map */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                <MapPin size={13} />
                Drag marker to exact lot / apartment
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {lat.toFixed(5)}, {lng.toFixed(5)}
              </span>
            </div>

            <div className="relative h-56 rounded-2xl overflow-hidden border border-sky-400/30 shadow-inner">
              <MapWrapper>
                <Map
                  key={`${lat}-${lng}`}
                  defaultCenter={{ lat, lng }}
                  defaultZoom={18}
                  mapTypeId="hybrid"
                  mapId="DEMO_MAP_ID"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  style={{ width: "100%", height: "100%" }}
                  disableDefaultUI={false}
                  zoomControl={true}
                >
                  <AdvancedMarker
                    position={{ lat, lng }}
                    draggable={true}
                    onDragEnd={(e: any) => {
                      if (e.latLng) {
                        setLat(Number(e.latLng.lat().toFixed(6)));
                        setLng(Number(e.latLng.lng().toFixed(6)));
                        setIsExactPin(true);
                        triggerHaptic("tap");
                      }
                    }}
                    title={`Lot/Unit Pin for #${stop.sequenceNumber}`}
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-400 text-slate-950 font-black text-xs border-2 border-white shadow-xl shadow-amber-500/40 animate-pulse">
                      #{stop.sequenceNumber}
                    </div>
                  </AdvancedMarker>
                </Map>
              </MapWrapper>
            </div>

            <div className="mt-2.5 flex gap-2">
              <button
                type="button"
                onClick={useDeviceLocation}
                disabled={locatingCurrent}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-amber-300/30 bg-amber-300/10 py-2.5 px-3 text-xs font-bold text-amber-200 active:scale-[0.98] disabled:opacity-50"
              >
                <LocateFixed size={14} className={locatingCurrent ? "animate-spin" : ""} />
                {locatingCurrent ? "Acquiring GPS..." : "📍 Set to My Current GPS"}
              </button>
              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isExactPin}
                  onChange={(e) => setIsExactPin(e.target.checked)}
                  className="rounded border-white/20 text-sky-400 focus:ring-0"
                />
                Exact Pin
              </label>
            </div>
          </div>

          {/* Sub-location / Complex Details Form */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                <Building2 size={13} className="text-sky-300" /> Lot or Unit #
              </label>
              <input
                type="text"
                value={lotOrUnit}
                onChange={(e) => setLotOrUnit(e.target.value)}
                placeholder="e.g. Lot 87, #403C, Bldg 2"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-sky-400/50 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                <Key size={13} className="text-amber-300" /> Gate / Access Code
              </label>
              <input
                type="text"
                value={gateCode}
                onChange={(e) => setGateCode(e.target.value)}
                placeholder="e.g. #1234, Keypad 402"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-sky-400/50 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              Mobile Home Park / Complex Name
            </label>
            <input
              type="text"
              value={complexName}
              onChange={(e) => setComplexName(e.target.value)}
              placeholder="e.g. Jasper Mobile Home Park, Harbor View Mobile Manor"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-sky-400/50 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              Interior Lot Navigation Notes
            </label>
            <textarea
              value={pinNotes}
              onChange={(e) => setPinNotes(e.target.value)}
              rows={2}
              placeholder="e.g. 2nd row on left after mailboxes, park in carport, toss on right side porch"
              className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-sky-400/50 outline-none"
            />
          </div>
        </div>

        {/* Action Footer */}
        <div className="border-t border-white/10 p-4 bg-black/40 space-y-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={updateDetails.isPending}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-amber-300 text-slate-950 font-black text-sm active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-sky-950/40"
          >
            {updateDetails.isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
            ) : (
              <Check size={18} />
            )}
            Save Exact Lot Coordinates & Notes
          </button>
        </div>
      </div>
    </div>
  );
}
