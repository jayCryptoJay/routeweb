import { real, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Core user table backing Manus OAuth.
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * The route is intentionally modeled as a single ordered sequence. The
 * sequenceNumber is unique and must never be rewritten by the UI.
 */
export const deliveryStops = sqliteTable(
  "delivery_stops",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    routeId: text("routeId"), // Added for grouping routes
    driverId: text("driverId"), // Allow assigning a stop to a driver id
    sequenceNumber: integer("sequenceNumber").notNull(),
    address: text("address").notNull(),
    municipality: text("municipality").notNull(),
    roadLabel: text("roadLabel").notNull(),
    publicationType: text("publicationType").default("Tampa Bay Times").notNull(),
    status: text("status", { enum: ["pending", "completed", "skipped"] }).default("pending").notNull(),
    lat: real("lat"),
    lng: real("lng"),
    notes: text("notes"),
    specialRequest: text("specialRequest"),
    lotOrUnit: text("lotOrUnit"),
    complexName: text("complexName"),
    gateCode: text("gateCode"),
    pinNotes: text("pinNotes"),
    isExactPin: integer("isExactPin").default(0),
    completedAt: integer("completedAt", { mode: "timestamp" }),
    createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  },
  table => ({
    statusIdx: index("delivery_stops_status_idx").on(table.status),
    sequenceIdx: index("delivery_stops_sequence_idx").on(table.sequenceNumber),
  }),
);

export type DeliveryStop = typeof deliveryStops.$inferSelect;
export type InsertDeliveryStop = typeof deliveryStops.$inferInsert;
