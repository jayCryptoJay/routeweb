const Database = require('better-sqlite3');
const db = new Database('sqlite.db');
db.exec('DELETE FROM delivery_stops;');
