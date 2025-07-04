const pool = require('../db/connection');

// Order model methods
const createOrder = async (order) => {
  const [result] = await pool.execute(
    `INSERT INTO orders (user_id, service_type, service_identifier, amount, payment_method, payer_name, payer_phone, status, payment_proof) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [order.user_id, order.service_type, order.service_identifier, order.amount, order.payment_method, order.payer_name, order.payer_phone, order.status || 'pending', order.payment_proof || null]
  );
  return result.insertId;
};

const getOrdersByUser = async (user_id) => {
  const [rows] = await pool.execute('SELECT * FROM orders WHERE user_id = ?', [user_id]);
  return rows;
};

const getOrderById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [id]);
  return rows[0];
};

const updateOrderStatus = async (id, status) => {
  await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
};

module.exports = {
  createOrder,
  getOrdersByUser,
  getOrderById,
  updateOrderStatus,
}; 