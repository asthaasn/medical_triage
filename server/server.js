const express = require('express');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const db = new Database('data.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    name_key   TEXT NOT NULL UNIQUE,
    role       TEXT,
    pin_salt   TEXT NOT NULL,
    pin_hash   TEXT NOT NULL,
    token      TEXT,
    progress   TEXT,
    updated_at TEXT
  );
`);

const app = express();
app.use(express.json({ limit: '200kb' }));

const hashPin = (pin, salt) => crypto.scryptSync(pin, salt, 32).toString('hex');

// Looks up the player from the "Authorization: Bearer <token>" header
const auth = (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const row = token && db.prepare('SELECT * FROM players WHERE token = ?').get(token);
  if (!row) return res.status(401).json({ error: 'Session expired. Please log in again.' });
  req.player = row;
  next();
};

const view = (row) => ({
  name: row.name,
  role: row.role,
  progress: row.progress ? JSON.parse(row.progress) : null,
});

// Create account on first login, verify PIN afterwards
app.post('/api/login', (req, res) => {
  const name = String(req.body.name || '').trim();
  const pin = String(req.body.pin || '');
  const role = String(req.body.role || '');
  if (!name || name.length > 60) return res.status(400).json({ error: 'Enter your name.' });
  if (!/^\d{4}$/.test(pin)) return res.status(400).json({ error: 'PIN must be exactly 4 digits.' });

  const key = name.toLowerCase();
  let row = db.prepare('SELECT * FROM players WHERE name_key = ?').get(key);

  if (!row) {
    const salt = crypto.randomBytes(16).toString('hex');
    db.prepare(
      'INSERT INTO players (name, name_key, role, pin_salt, pin_hash) VALUES (?, ?, ?, ?, ?)'
    ).run(name, key, role, salt, hashPin(pin, salt));
    row = db.prepare('SELECT * FROM players WHERE name_key = ?').get(key);
  } else {
    const given = Buffer.from(hashPin(pin, row.pin_salt));
    const real = Buffer.from(row.pin_hash);
    if (!crypto.timingSafeEqual(given, real)) {
      return res.status(401).json({ error: 'Wrong PIN for this name.' });
    }
  }

  const token = crypto.randomBytes(24).toString('hex');
  db.prepare('UPDATE players SET token = ?, role = ? WHERE id = ?')
    .run(token, role || row.role, row.id);
  row = db.prepare('SELECT * FROM players WHERE id = ?').get(row.id);

  res.json({ token, ...view(row) });
});

// Who am I? (used to resume after a page refresh)
app.get('/api/me', auth, (req, res) => res.json(view(req.player)));

// Save progress
app.put('/api/progress', auth, (req, res) => {
  db.prepare('UPDATE players SET progress = ?, updated_at = ? WHERE id = ?')
    .run(JSON.stringify(req.body), new Date().toISOString(), req.player.id);
  res.json({ ok: true });
});

// Wipe progress (for "Start a new shift")
app.delete('/api/progress', auth, (req, res) => {
  db.prepare('UPDATE players SET progress = NULL WHERE id = ?').run(req.player.id);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));