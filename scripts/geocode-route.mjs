import { makeRequest } from "../server/_core/map.ts";
import { getUnlocatedStops, updateCoordinates } from "../server/db.ts";

const stops = await getUnlocatedStops();
let located = 0;
let notFound = 0;
let failed = 0;
for (let index = 0; index < stops.length; index += 8) {
  const batch = stops.slice(index, index + 8);
  await Promise.all(batch.map(async stop => {
    try {
      const result = await makeRequest("/maps/api/geocode/json", { address: stop.address });
      const location = result.results?.[0]?.geometry?.location;
      if (result.status === "OK" && location) {
        await updateCoordinates(stop.id, location.lat, location.lng);
        located += 1;
      } else {
        notFound += 1;
      }
    } catch (error) {
      failed += 1;
      console.warn(`Could not locate stop #${stop.sequenceNumber}:`, error?.message ?? error);
    }
  }));
  console.log(`Processed ${Math.min(index + batch.length, stops.length)} / ${stops.length}`);
}
console.log(JSON.stringify({ attempted: stops.length, located, notFound, failed }));
