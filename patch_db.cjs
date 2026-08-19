const fs = require('fs');
let content = fs.readFileSync('server/db.ts', 'utf-8');

content = content.replace('import { drizzle } from "drizzle-orm/mysql2";', 'import { drizzle } from "drizzle-orm/better-sqlite3";\nimport Database from "better-sqlite3";');

content = content.replace(
  `let _db: ReturnType<typeof drizzle> | null = null;
let _seedPromise: Promise<void> | null = null;

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
}`,
  `let _db: ReturnType<typeof drizzle> | null = null;
let _seedPromise: Promise<void> | null = null;

export async function getDb() {
  if (!_db) {
    try {
      const sqlite = new Database('sqlite.db');
      _db = drizzle(sqlite);
      
      sqlite.exec(\`
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
          sequenceNumber INTEGER NOT NULL UNIQUE,
          address TEXT NOT NULL,
          municipality TEXT NOT NULL,
          roadLabel TEXT NOT NULL,
          publicationType TEXT DEFAULT 'Tampa Bay Times' NOT NULL,
          status TEXT DEFAULT 'pending' NOT NULL,
          lat REAL,
          lng REAL,
          notes TEXT,
          specialRequest TEXT,
          completedAt INTEGER,
          createdAt INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL,
          updatedAt INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
        );
      \`);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}`
);

content = content.replace(
  `.onDuplicateKeyUpdate({ set: updateSet })`,
  `.onConflictDoUpdate({ target: users.openId, set: updateSet })`
);

content = content.replace(
  `.onDuplicateKeyUpdate({
      set: {
        address: sql\`VALUES(address)\`,
        municipality: sql\`VALUES(municipality)\`,
        roadLabel: sql\`VALUES(roadLabel)\`,
      },
    });`,
  `.onConflictDoUpdate({
      target: deliveryStops.sequenceNumber,
      set: {
        address: sql\`excluded.address\`,
        municipality: sql\`excluded.municipality\`,
        roadLabel: sql\`excluded.roadLabel\`,
      },
    });`
);

// We also added an ALTER TABLE previously, we can remove it or keep it for sqlite:
content = content.replace(
  `await db.execute(sql\`ALTER TABLE delivery_stops ADD COLUMN publicationType VARCHAR(64) DEFAULT 'Tampa Bay Times' NOT NULL\`);`,
  `await db.execute(sql\`ALTER TABLE delivery_stops ADD COLUMN publicationType TEXT DEFAULT 'Tampa Bay Times' NOT NULL\`);`
);

fs.writeFileSync('server/db.ts', content);
