const express = require('express');
const router = express.Router();
const orderModel = require('../models/order');
const userModel = require('../models/user');

router.get('/', (req, res) => {
  res.json({
    telebirrPhone: process.env.TELEBIRR_PHONE || '',
    cbebirrPhone: process.env.CBEBIRR_PHONE || '',
    cbeAccount: process.env.CBE_ACCOUNT || '',
    telebirrName: process.env.TELEBIRR_NAME || '',
    cbebirrName: process.env.CBEBIRR_NAME || '',
    cbeAccountName: process.env.CBE_ACCOUNT_NAME || '',
    telebirrDeepLink: process.env.TELEBIRR_DEEPLINK || '',
    cbebirrDeepLink: process.env.CBEBIRR_DEEPLINK || '',
    cbeDirectDeepLink: process.env.CBE_DIRECT_DEEPLINK || ''
  });
});

// Receive SMS payment notification from Android device
// Expected body: { payer_name, payer_phone, amount, txn_id }
router.post('/sms', async (req, res) => {
  const { payer_name, payer_phone, amount, txn_id } = req.body;
  if (!payer_phone && !payer_name) {
    return res.status(400).json({ error: 'payer_phone or payer_name required' });
  }
  try {
    // Try to find a pending order matching phone, name, and amount
    let query = 'SELECT * FROM orders WHERE status = ? AND amount = ?';
    let params = ['pending', amount];
    if (payer_phone) {
      query += ' AND payer_phone = ?';
      params.push(payer_phone);
    } else if (payer_name) {
      query += ' AND payer_name = ?';
      params.push(payer_name);
    }
    const pool = require('../db/connection');
    const [orders] = await pool.execute(query, params);
    if (orders.length === 0) {
      return res.status(404).json({ error: 'No matching pending order found' });
    }
    // For simplicity, update the first match
    const order = orders[0];
    await orderModel.updateOrderStatus(order.id, 'paid');
    // Store txn_id as payment_proof
    await pool.execute('UPDATE orders SET payment_proof = ? WHERE id = ?', [txn_id, order.id]);
    res.json({ message: 'Order marked as paid', order_id: order.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process SMS payment' });
  }
});

module.exports = router; 