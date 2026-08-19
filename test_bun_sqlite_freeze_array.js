import { Database } from "bun:sqlite";
const db = new Database(":memory:");
db.run("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)");
db.run("INSERT INTO test (name) VALUES ('hello'), ('world')");
const rows = db.query("SELECT * FROM test").all();
console.log("Is array frozen?", Object.isFrozen(rows));
rows.sort((a,b) => b.id - a.id);
console.log("Sorted array:", rows);
