import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { creatures, InsertUser, playerProfiles, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function ensurePlayerProfile(userId: number, sourceName?: string | null) {
  const db = await getDb();
  if (!db) return undefined;
  const existing = await db.select().from(playerProfiles).where(eq(playerProfiles.userId, userId)).limit(1);
  if (existing[0]) return existing[0];
  const handle = (sourceName || "Riftwalker").replace(/[^a-zA-Z0-9_]/g, "").slice(0, 24) || "Riftwalker";
  await db.insert(playerProfiles).values({
    userId,
    handle,
    xp: 0,
    level: 1,
    discoveriesJson: "[]",
    specialty: "Field Walker",
  });
  return (await db.select().from(playerProfiles).where(eq(playerProfiles.userId, userId)).limit(1))[0];
}

export async function getCreaturesForPlayer(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(creatures).where(eq(creatures.creatorId, userId)).orderBy(desc(creatures.createdAt)).limit(50);
}

export async function saveCreatureForPlayer(userId: number, creature: Omit<typeof creatures.$inferInsert, "creatorId">) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(creatures).values({ ...creature, creatorId: userId }).onDuplicateKeyUpdate({
    set: {
      name: creature.name,
      dna: creature.dna,
      genomeJson: creature.genomeJson,
      scoreJson: creature.scoreJson,
      rarity: creature.rarity,
      rarityReason: creature.rarityReason,
      parentIdsJson: creature.parentIdsJson,
      generation: creature.generation,
      previewKey: creature.previewKey,
    },
  });
  return (await db.select().from(creatures).where(eq(creatures.id, creature.id)).limit(1))[0];
}
