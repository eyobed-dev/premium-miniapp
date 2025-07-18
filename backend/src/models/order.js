const db = require('../db/connection');
const { promisify } = require('util');

const run = promisify(db.run.bind(db));
const get = promisify(db.get.bind(db));
const all = promisify(db.all.bind(db));

const createOrder = async (order) => {
  const stmt = `INSERT INTO orders (user_id, service_type, service_identifier, amount, payment_method, payer_name, payer_phone, status, payment_proof) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const result = await run(stmt, [order.user_id, order.service_type, order.service_identifier, order.amount, order.payment_method, order.payer_name, order.payer_phone, order.status || 'pending', order.payment_proof || null]);
  // SQLite: lastID is available on the statement object
  return result.lastID;
};

const getOrdersByUser = async (user_id) => {
  return all('SELECT * FROM orders WHERE user_id = ?', [user_id]);
};

const getOrderById = async (id) => {
  return get('SELECT * FROM orders WHERE id = ?', [id]);
};

const updateOrderStatus = async (id, status) => {
  await run('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
};

module.exports = {
  createOrder,
  getOrdersByUser,
  getOrderById,
  updateOrderStatus,
}; 