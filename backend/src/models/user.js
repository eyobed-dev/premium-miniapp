const pool = require('../db/connection');

const createUser = async (user) => {
  const [result] = await pool.execute(
    `INSERT INTO users (telegram_id, telegram_username, first_name, last_name, language_code) VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE telegram_username = VALUES(telegram_username), first_name = VALUES(first_name), last_name = VALUES(last_name), language_code = VALUES(language_code)`,
    [user.telegram_id, user.telegram_username, user.first_name, user.last_name, user.language_code]
  );
  return result.insertId || user.telegram_id;
};

const getUserByTelegramId = async (telegram_id) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE telegram_id = ?', [telegram_id]);
  return rows[0];
};

const getUserById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

module.exports = {
  createUser,
  getUserByTelegramId,
  getUserById,
}; 