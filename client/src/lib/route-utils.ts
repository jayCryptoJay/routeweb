export type DeliveryStopLike = {
  address: string;
  municipality?: string | null;
  roadLabel?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export function buildNavigationUrl(stop: DeliveryStopLike | string) {
  const target = typeof stop === "string" ? stop : stop.lat != null && stop.lng != null ? `${stop.lat},${stop.lng}` : stop.address;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(target)}`;
}

export function formatCoordinates(lat?: number | null, lng?: number | null) {
  if (lat == null || lng == null) return null;
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export function cleanInstruction(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();
}

export function pinColor(status: string, isNext: boolean) {
  if (isNext) return "#fbbf24";
  if (status === "completed") return "#34d399";
  if (status === "skipped") return "#94a3b8";
  return "#60a5fa";
}
