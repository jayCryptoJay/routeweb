import { index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Persistent creative identity for one authenticated player. */
export const playerProfiles = mysqlTable("player_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  handle: varchar("handle", { length: 40 }).notNull(),
  xp: int("xp").notNull().default(0),
  level: int("level").notNull().default(1),
  discoveriesJson: text("discoveriesJson").notNull(),
  specialty: varchar("specialty", { length: 64 }).notNull().default("Field Walker"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("player_profiles_user_idx").on(table.userId)]);

/** Immutable, reproducible mathematical artifact owned by a player. */
export const creatures = mysqlTable("creatures", {
  id: varchar("id", { length: 48 }).primaryKey(),
  creatorId: int("creatorId").notNull().references(() => users.id),
  name: varchar("name", { length: 64 }).notNull(),
  family: varchar("family", { length: 32 }).notNull(),
  generatorVersion: varchar("generatorVersion", { length: 24 }).notNull(),
  seed: varchar("seed", { length: 24 }).notNull(),
  dna: text("dna").notNull(),
  genomeJson: text("genomeJson").notNull(),
  scoreJson: text("scoreJson").notNull(),
  rarity: mysqlEnum("rarity", ["common", "uncommon", "rare", "extreme", "anomalous", "singular"]).notNull(),
  rarityReason: text("rarityReason").notNull(),
  parentIdsJson: text("parentIdsJson").notNull(),
  generation: int("generation").notNull().default(0),
  previewKey: varchar("previewKey", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [index("creatures_creator_idx").on(table.creatorId), index("creatures_family_idx").on(table.family)]);

/** A deterministic date-specific creative constraint. */
export const fieldTrials = mysqlTable("field_trials", {
  id: varchar("id", { length: 64 }).primaryKey(),
  trialDate: varchar("trialDate", { length: 10 }).notNull().unique(),
  title: varchar("title", { length: 120 }).notNull(),
  constraintType: varchar("constraintType", { length: 32 }).notNull(),
  constraintJson: text("constraintJson").notNull(),
  baseSeed: varchar("baseSeed", { length: 24 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [index("field_trials_date_idx").on(table.trialDate)]);

/** A player's explicit entry of one artifact into a field trial. */
export const trialSubmissions = mysqlTable("trial_submissions", {
  id: int("id").autoincrement().primaryKey(),
  trialId: varchar("trialId", { length: 64 }).notNull().references(() => fieldTrials.id),
  creatureId: varchar("creatureId", { length: 48 }).notNull().references(() => creatures.id),
  creatorId: int("creatorId").notNull().references(() => users.id),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("trial_submission_creature_unique").on(table.trialId, table.creatureId),
  index("trial_submission_creator_idx").on(table.creatorId),
]);

export type PlayerProfile = typeof playerProfiles.$inferSelect;
export type Creature = typeof creatures.$inferSelect;
export type FieldTrial = typeof fieldTrials.$inferSelect;
export type TrialSubmission = typeof trialSubmissions.$inferSelect;
