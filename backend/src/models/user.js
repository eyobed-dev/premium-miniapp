const db = require('../db/connection');
const { promisify } = require('util');

const run = promisify(db.run.bind(db));
const get = promisify(db.get.bind(db));
const all = promisify(db.all.bind(db));

const createUser = async (user) => {
  // Try to insert, ignore if exists
  await run(`INSERT OR IGNORE INTO users (telegram_id, telegram_username, first_name, last_name, language_code) VALUES (?, ?, ?, ?, ?)`, [user.telegram_id, user.telegram_username, user.first_name, user.last_name, user.language_code]);
  // Always update fields in case of conflict
  await run(`UPDATE users SET telegram_username = ?, first_name = ?, last_name = ?, language_code = ? WHERE telegram_id = ?`, [user.telegram_username, user.first_name, user.last_name, user.language_code, user.telegram_id]);
  // Return the user id
  const row = await get('SELECT id FROM users WHERE telegram_id = ?', [user.telegram_id]);
  return row ? row.id : null;
};

const getUserByTelegramId = async (telegram_id) => {
  return get('SELECT * FROM users WHERE telegram_id = ?', [telegram_id]);
};

const getUserById = async (id) => {
  return get('SELECT * FROM users WHERE id = ?', [id]);
};

module.exports = {
  createUser,
  getUserByTelegramId,
  getUserById,
}; 