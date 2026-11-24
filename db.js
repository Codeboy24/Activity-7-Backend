// Creates the SQLite database connection and exports a small "pool" object
// with a query(sql, params) method, so routes can use $1, $2 ... placeholders.
// Uses Node's built-in SQLite module (node:sqlite), so no native package is needed.
const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const dbPath = path.resolve(__dirname, process.env.DB_PATH || "data/records.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec("PRAGMA journal_mode = WAL;");

// Create the table, then seed it once when it has never had any rows.
db.exec(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"));
const neverUsed =
  db.prepare("SELECT COUNT(*) AS n FROM records").get().n === 0 &&
  db.prepare("SELECT COUNT(*) AS n FROM sqlite_sequence WHERE name = 'records'").get().n === 0;
if (neverUsed) {
  db.exec(fs.readFileSync(path.join(__dirname, "seed.sql"), "utf8"));
  console.log("Database seeded with starting records.");
}

// $1, $2 ... become SQLite numbered parameters ?1, ?2 ...
function toSqlite(sql) {
  return sql.replace(/\$(\d+)/g, "?$1");
}

const pool = {
  async query(sql, params = []) {
    const statement = db.prepare(toSqlite(sql));
    const isRead = /^\s*select/i.test(sql) || /\breturning\b/i.test(sql);
    if (isRead) {
      const rows = statement.all(...params).map(row => ({ ...row }));
      return { rows, rowCount: rows.length };
    }
    const info = statement.run(...params);
    return { rows: [], rowCount: Number(info.changes) };
  }
};

module.exports = pool;
