import { makeRequest } from "../server/_core/map.ts";
import { getDb, ensureRouteSeeded, listDeliveryStops, updateCoordinates } from "../server/db.ts";
import fs from "fs";

await ensureRouteSeeded();
const stops = await listDeliveryStops();
console.log(`Found ${stops.length} stops in database.`);

let located = 0;
let failed = 0;

for (let i = 0; i < stops.length; i += 5) {
  const batch = stops.slice(i, i + 5);
  await Promise.all(batch.map(async (stop) => {
    // If stop already has lat/lng, skip
    if (stop.lat && stop.lng) {
      located++;
      return;
    }

    try {
      // Clean address for geocoding (some mobile home park lots are better found with base address)
      const cleanAddress = stop.address.replace(/#\w+|\b(?:Apt|Unit|Lot|Bldg|Suite|Spc)\s*#?\w+/gi, '').trim();
      const result = await makeRequest("/maps/api/geocode/json", { address: cleanAddress });
      const location = result.results?.[0]?.geometry?.location;
      if (result.status === "OK" && location) {
        await updateCoordinates(stop.id, location.lat, location.lng);
        located++;
      } else {
        console.warn(`Could not locate stop #${stop.sequenceNumber}: ${stop.address}`);
        failed++;
      }
    } catch (e) {
      console.warn(`Geocode error on #${stop.sequenceNumber}:`, e.message || e);
      failed++;
    }
  }));
  console.log(`Geocoded ${Math.min(i + 5, stops.length)}/${stops.length}`);
}

console.log(`Geocoding complete! Total located: ${located}, Failed: ${failed}`);
