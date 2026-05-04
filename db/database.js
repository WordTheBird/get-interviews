const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// When running under Electron, store DB in user's app data folder.
// When running normally (npm start), keep it next to the source.
function getDbPath() {
    if (process.env.ELECTRON_RUN === 'true') {
        try {
            const { app } = require('electron');
            const userData = app.getPath('userData');
            if (!fs.existsSync(userData)) fs.mkdirSync(userData, { recursive: true });
            return path.join(userData, 'resumate.db');
        } catch (e) {
            // Fallback if electron module isn't available
            return path.join(__dirname, 'resumate.db');
        }
    }
    return path.join(__dirname, 'resumate.db');
}

const dbPath = getDbPath();
console.log('Database location:', dbPath);

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Run schema (using path that works both packaged and unpackaged)
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

module.exports = db;