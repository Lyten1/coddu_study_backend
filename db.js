const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "main.db");

function getDatabaseConnection() {
    return new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error("Failed to connect to the database:", err);
        }
    });
}

module.exports = { getDatabaseConnection };