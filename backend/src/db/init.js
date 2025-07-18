const db = require('./connection');

function initDB() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id INTEGER NOT NULL UNIQUE,
      telegram_username TEXT,
      first_name TEXT,
      last_name TEXT,
      language_code TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      service_type TEXT NOT NULL,
      service_identifier TEXT,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payer_name TEXT,
      payer_phone TEXT,
      status TEXT DEFAULT 'pending',
      payment_proof TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  });
  console.log('SQLite database initialized');
}

initDB(); 