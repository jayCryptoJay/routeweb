import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { deliveryStops, InsertUser, users } from "../drizzle/schema";
import { ROUTE_STOPS } from "../shared/route-data";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let _seedPromise: Promise<void> | null = null;

export async function getDb() {
  if (!_db) {
    try {
      const sqlite = new Database('sqlite.db');
      _db = drizzle(sqlite);
      
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          openId TEXT NOT NULL UNIQUE,
          name TEXT,
          email TEXT,
          loginMethod TEXT,
          role TEXT DEFAULT 'user' NOT NULL,
          createdAt INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL,
          updatedAt INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL,
          lastSignedIn INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
        );
        CREATE TABLE IF NOT EXISTS delivery_stops (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          routeId TEXT,
          driverId TEXT,
          sequenceNumber INTEGER NOT NULL,
          address TEXT NOT NULL,
          municipality TEXT NOT NULL,
          roadLabel TEXT NOT NULL,
          publicationType TEXT DEFAULT 'Tampa Bay Times' NOT NULL,
          status TEXT DEFAULT 'pending' NOT NULL,
          lat REAL,
          lng REAL,
          notes TEXT,
          specialRequest TEXT,
          lotOrUnit TEXT,
          complexName TEXT,
          gateCode TEXT,
          pinNotes TEXT,
          isExactPin INTEGER DEFAULT 0,
          completedAt INTEGER,
          createdAt INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL,
          updatedAt INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
        );
      `);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function ensureRouteSeeded() {
  if (_seedPromise) return _seedPromise;
  _seedPromise = (async () => {
    const db = await getDb();
    if (!db) throw new Error("Database is not configured");

    const migrations = [
      `ALTER TABLE delivery_stops ADD COLUMN publicationType TEXT DEFAULT 'Tampa Bay Times' NOT NULL`,
      `ALTER TABLE delivery_stops ADD COLUMN lotOrUnit TEXT`,
      `ALTER TABLE delivery_stops ADD COLUMN complexName TEXT`,
      `ALTER TABLE delivery_stops ADD COLUMN gateCode TEXT`,
      `ALTER TABLE delivery_stops ADD COLUMN pinNotes TEXT`,
      `ALTER TABLE delivery_stops ADD COLUMN isExactPin INTEGER DEFAULT 0`,
    ];

    for (const migration of migrations) {
      try {
        await db.run(sql.raw(migration));
      } catch (e) {
        // Column likely already exists
      }
    }

    const result = await db.select({ count: sql<number>`count(*)` }).from(deliveryStops);
    const count = Number(result[0]?.count ?? 0);
    // If count doesn't match the new route stops length (e.g. 162 stops), re-seed
    if (count === ROUTE_STOPS.length) return;

    // Delete existing stops for safety if we are re-seeding
    await db.delete(deliveryStops);

    await db.insert(deliveryStops).values(
      ROUTE_STOPS.map(stop => ({
        sequenceNumber: stop.sequenceNumber,
        address: stop.address,
        municipality: stop.municipality,
        roadLabel: stop.roadLabel,
        lotOrUnit: stop.lotOrUnit || null,
        complexName: stop.complexName || null,
        lat: stop.lat ?? null,
        lng: stop.lng ?? null,
        status: "pending" as const,
        routeId: "default",
      })),
    );
  })();
  try {
    await _seedPromise;
  } finally {
    _seedPromise = null;
  }
}

export async function listDeliveryStops(status?: "pending" | "completed" | "skipped", routeId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await ensureRouteSeeded();
  const conditions = [];
  if (status) conditions.push(eq(deliveryStops.status, status));
  if (routeId) conditions.push(eq(deliveryStops.routeId, routeId));

  if (conditions.length > 0) {
    return db.select().from(deliveryStops).where(and(...conditions)).orderBy(asc(deliveryStops.sequenceNumber));
  }

  return db.select().from(deliveryStops).orderBy(asc(deliveryStops.sequenceNumber));
}

export async function getDeliveryStop(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await ensureRouteSeeded();
  const rows = await db.select().from(deliveryStops).where(eq(deliveryStops.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function updateDeliveryStatus(id: number, status: "completed" | "skipped" | "pending") {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await ensureRouteSeeded();
  const completedAt = status === "completed" ? new Date() : null;
  await db.update(deliveryStops).set({ status, completedAt }).where(eq(deliveryStops.id, id));
  return getDeliveryStop(id);
}

export async function updateDeliveryDetails(id: number, data: {
  notes?: string | null;
  specialRequest?: string | null;
  publicationType?: string;
  lat?: number | null;
  lng?: number | null;
  lotOrUnit?: string | null;
  complexName?: string | null;
  gateCode?: string | null;
  pinNotes?: string | null;
  isExactPin?: number | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await ensureRouteSeeded();
  
  const setPayload: Record<string, any> = {};
  if (data.notes !== undefined) setPayload.notes = data.notes;
  if (data.specialRequest !== undefined) setPayload.specialRequest = data.specialRequest;
  if (data.publicationType !== undefined) setPayload.publicationType = data.publicationType;
  if (data.lat !== undefined) setPayload.lat = data.lat;
  if (data.lng !== undefined) setPayload.lng = data.lng;
  if (data.lotOrUnit !== undefined) setPayload.lotOrUnit = data.lotOrUnit;
  if (data.complexName !== undefined) setPayload.complexName = data.complexName;
  if (data.gateCode !== undefined) setPayload.gateCode = data.gateCode;
  if (data.pinNotes !== undefined) setPayload.pinNotes = data.pinNotes;
  if (data.isExactPin !== undefined) setPayload.isExactPin = data.isExactPin;

  if (Object.keys(setPayload).length > 0) {
    await db.update(deliveryStops).set(setPayload).where(eq(deliveryStops.id, id));
  }
  return getDeliveryStop(id);
}

export async function getRouteSummary(routeId?: string) {
  const stops = await listDeliveryStops(undefined, routeId);
  const total = stops.length;
  const completed = stops.filter(stop => stop.status === "completed").length;
  const pending = stops.filter(stop => stop.status === "pending").length;
  const skipped = stops.filter(stop => stop.status === "skipped").length;
  const located = stops.filter(stop => stop.lat !== null && stop.lng !== null).length;
  const nextPending = stops.find(stop => stop.status === "pending") ?? null;
  return {
    total,
    completed,
    pending,
    skipped,
    located,
    unlocated: total - located,
    completionPercentage: total ? Math.round((completed / total) * 100) : 0,
    nextPending,
  };
}

export async function updateCoordinates(id: number, lat: number, lng: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(deliveryStops).set({ lat, lng }).where(eq(deliveryStops.id, id));
}

export async function getUnlocatedStops(routeId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await ensureRouteSeeded();
  
  const conditions = [isNull(deliveryStops.lat), isNull(deliveryStops.lng)];
  if (routeId) conditions.push(eq(deliveryStops.routeId, routeId));

  return db.select().from(deliveryStops).where(and(...conditions)).orderBy(asc(deliveryStops.sequenceNumber));
}

export async function optimizePendingStops(startLat?: number, startLng?: number, routeId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");

  const allStops = await listDeliveryStops(undefined, routeId);
  const doneStops = allStops.filter(s => s.status !== "pending");
  let pendingStops = allStops.filter(s => s.status === "pending");

  if (pendingStops.length <= 1) return;

  // Use nearest-neighbor to optimize
  let nextSeq = doneStops.length > 0 ? Math.max(...doneStops.map(s => s.sequenceNumber)) + 1 : 1;
  let currentLat = startLat;
  let currentLng = startLng;

  if (currentLat == null || currentLng == null) {
    const firstWithCoords = pendingStops.find(s => s.lat != null && s.lng != null);
    if (firstWithCoords) {
      currentLat = firstWithCoords.lat!;
      currentLng = firstWithCoords.lng!;
    }
  }

  const orderedStops = [];
  let unvisited = [...pendingStops];

  function dist(s: any) {
    if (s.lat == null || s.lng == null || currentLat == null || currentLng == null) return Infinity;
    const p = 0.017453292519943295; // Math.PI / 180
    const c = Math.cos;
    const a = 0.5 - c((s.lat - currentLat) * p) / 2 +
            c(currentLat * p) * c(s.lat * p) *
            (1 - c((s.lng - currentLng) * p)) / 2;
    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  }

  while (unvisited.length > 0) {
    if (currentLat != null && currentLng != null) {
      unvisited.sort((a, b) => dist(a) - dist(b));
    }
    const nearest = unvisited.shift()!;
    orderedStops.push(nearest);
    if (nearest.lat != null && nearest.lng != null) {
      currentLat = nearest.lat;
      currentLng = nearest.lng;
    }
  }

  // Update sequentially for sqlite compatibility
  for (let i = 0; i < orderedStops.length; i++) {
    await db.update(deliveryStops)
      .set({ sequenceNumber: nextSeq + i })
      .where(eq(deliveryStops.id, orderedStops[i].id));
  }
}
