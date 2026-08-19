import { ROUTE_STOPS, type RouteStopSeed } from "@shared/route-data";

export type DeliveryStatus = "pending" | "completed" | "skipped";

export type LocalDeliveryStop = RouteStopSeed & {
  id: number;
  status: DeliveryStatus;
  completedAt: number | null;
  notes: string;
  specialRequest: string;
  publicationType: "Tampa Bay Times" | "New York Times";
};

const STORAGE_KEY = "routeweb-delivery-state-v1";

function makeDefaultStops(): LocalDeliveryStop[] {
  return ROUTE_STOPS.map(stop => ({
    ...stop,
    id: stop.sequenceNumber,
    status: "pending",
    completedAt: null,
    notes: "",
    specialRequest: "",
    publicationType: "Tampa Bay Times",
  }));
}

function hasValidRoute(value: unknown): value is LocalDeliveryStop[] {
  if (!Array.isArray(value) || value.length !== ROUTE_STOPS.length) return false;
  return value.every((stop, index) => (
    typeof stop === "object"
    && stop !== null
    && (stop as LocalDeliveryStop).sequenceNumber === ROUTE_STOPS[index]?.sequenceNumber
    && ["pending", "completed", "skipped"].includes((stop as LocalDeliveryStop).status)
  ));
}

export function loadLocalDeliveryStops(): LocalDeliveryStop[] {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return makeDefaultStops();
    const parsed: unknown = JSON.parse(saved);
    return hasValidRoute(parsed) ? parsed : makeDefaultStops();
  } catch {
    return makeDefaultStops();
  }
}

export function saveLocalDeliveryStops(stops: LocalDeliveryStop[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stops));
}

export function resetLocalDeliveryStops(): LocalDeliveryStop[] {
  const resetStops = makeDefaultStops();
  saveLocalDeliveryStops(resetStops);
  return resetStops;
}

export function routeSummary(stops: LocalDeliveryStop[]) {
  const total = stops.length;
  const completed = stops.filter(stop => stop.status === "completed").length;
  const pending = stops.filter(stop => stop.status === "pending").length;
  const skipped = stops.filter(stop => stop.status === "skipped").length;
  const nextPending = stops.find(stop => stop.status === "pending") ?? null;
  return {
    total,
    completed,
    pending,
    skipped,
    nextPending,
    completionPercentage: total ? Math.round((completed / total) * 100) : 0,
  };
}
