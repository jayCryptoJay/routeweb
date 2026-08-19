import { ensureRouteSeeded } from "../server/db.ts";

await ensureRouteSeeded();
console.log("Route seed verified.");
