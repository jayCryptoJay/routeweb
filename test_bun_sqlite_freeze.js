import { Database } from "bun:sqlite";
const db = new Database(":memory:");
db.run("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)");
db.run("INSERT INTO test (name) VALUES ('hello')");
const rows = db.query("SELECT * FROM test").all();
console.log("Is frozen?", Object.isFrozen(rows[0]));
rows[0].name = 'world';
console.log("Mutated name:", rows[0].name);
